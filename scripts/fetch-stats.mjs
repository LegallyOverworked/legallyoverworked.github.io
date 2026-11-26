#!/usr/bin/env node
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILES = [
  resolve(ROOT, 'src/data/stats.json'),
  resolve(ROOT, 'public/stats.json'),
];
const REQUEST_TIMEOUT_MS = 20_000;
const DAY_MS = 24 * 60 * 60 * 1000;

try {
  process.loadEnvFile?.(resolve(ROOT, '.env'));
} catch {
}

const GITLAB_URL = (process.env.GITLAB_URL || 'https://gitlab.kuleuven.be').replace(/\/+$/, '');

const isoDay = (date) => date.toISOString().slice(0, 10);
const warn = (message) =>
  console.log(process.env.GITHUB_ACTIONS ? `::warning::${message}` : `WARN  ${message}`);

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}


async function fetchGitHub(from, to) {
  const token = process.env.GH_STATS_TOKEN;
  if (!token) throw new Error('GH_STATS_TOKEN is not set');

  const query = `
    query ($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          restrictedContributionsCount
          totalPullRequestContributions
          totalIssueContributions
          totalPullRequestReviewContributions
          totalRepositoryContributions
          commitContributionsByRepository(maxRepositories: 100) { repository { id } }
          pullRequestContributionsByRepository(maxRepositories: 100) { repository { id } }
          issueContributionsByRepository(maxRepositories: 100) { repository { id } }
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
        repositories(ownerAffiliations: OWNER, isFork: false) { totalCount }
        publicRepos: repositories(ownerAffiliations: OWNER, isFork: false, privacy: PUBLIC) { totalCount }
        privateRepos: repositories(ownerAffiliations: OWNER, isFork: false, privacy: PRIVATE) { totalCount }
        archivedRepos: repositories(ownerAffiliations: OWNER, isFork: false, isArchived: true) { totalCount }
      }
    }`;

  const response = await fetchWithTimeout('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'portfolio-stats-fetcher',
    },
    body: JSON.stringify({ query, variables: { from: from.toISOString(), to: to.toISOString() } }),
  });
  if (!response.ok) throw new Error(`GitHub API responded with HTTP ${response.status}`);

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub API error: ${payload.errors.map((e) => e.type || 'UNKNOWN').join(', ')}`);
  }

  const viewer = payload.data.viewer;
  const { contributionsCollection: collection, repositories } = viewer;

  const contributedTo = new Set(
    [
      ...collection.commitContributionsByRepository,
      ...collection.pullRequestContributionsByRepository,
      ...collection.issueContributionsByRepository,
    ].map((entry) => entry.repository.id),
  );
  const days = {};
  for (const week of collection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) days[day.date] = day.contributionCount;
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    commits: collection.totalCommitContributions,
    privateContributions: collection.restrictedContributionsCount,
    contributions: collection.contributionCalendar.totalContributions,
    pullRequests: collection.totalPullRequestContributions,
    issues: collection.totalIssueContributions,
    reviews: collection.totalPullRequestReviewContributions,
    newRepos: collection.totalRepositoryContributions,
    activeRepos: collection.commitContributionsByRepository.length,
    activeProjects: contributedTo.size,
    repos: repositories.totalCount,
    publicRepos: viewer.publicRepos.totalCount,
    privateRepos: viewer.privateRepos.totalCount,
    archivedRepos: viewer.archivedRepos.totalCount,
    days,
  };
}


async function gitlabGet(path) {
  const token = process.env.GITLAB_STATS_TOKEN;
  if (!token) throw new Error('GITLAB_STATS_TOKEN is not set');

  const response = await fetchWithTimeout(`${GITLAB_URL}/api/v4${path}`, {
    headers: { 'PRIVATE-TOKEN': token, 'User-Agent': 'portfolio-stats-fetcher' },
  });
  if (!response.ok) throw new Error(`GitLab API responded with HTTP ${response.status}`);
  return response;
}

const GITLAB_ISSUE_TARGETS = new Set(['Issue', 'WorkItem']);

async function fetchGitLab(from, to) {
  const after = isoDay(new Date(from.getTime() - DAY_MS));
  const before = isoDay(new Date(to.getTime() + DAY_MS));
  const fromDay = isoDay(from);

  const days = {};
  let commits = 0;
  let contributions = 0;
  let pullRequests = 0;
  let issues = 0;
  let reviews = 0;
  const pushedProjects = new Set();
  const contributedProjects = new Set();
  let page = '1';
  let pages = 0;

  while (page) {
    if (++pages > 500) throw new Error('GitLab events pagination did not terminate');
    const response = await gitlabGet(
      `/events?after=${after}&before=${before}&per_page=100&page=${page}`,
    );
    const events = await response.json();

    for (const event of events) {
      const day = String(event.created_at).slice(0, 10);
      if (day < fromDay) continue;

      let count = 0;
      const push = event.push_data;
      if (push) {
        if (push.ref_type === 'branch' && push.action !== 'removed') {
          count = Number(push.commit_count) || 0;
          commits += count;
          if (count > 0 && event.project_id != null) pushedProjects.add(event.project_id);
        }
      } else if (event.target_type === 'MergeRequest' && event.action_name === 'opened') {
        count = 1;
        pullRequests += 1;
      } else if (event.target_type === 'MergeRequest' && event.action_name === 'approved') {
        count = 1;
        reviews += 1;
      } else if (GITLAB_ISSUE_TARGETS.has(event.target_type) && event.action_name === 'opened') {
        count = 1;
        issues += 1;
      }

      if (count > 0) {
        days[day] = (days[day] || 0) + count;
        contributions += count;
        if (event.project_id != null) contributedProjects.add(event.project_id);
      }
    }

    page = response.headers.get('x-next-page') || '';
  }

  const countProjects = async (filter = '') => {
    try {
      const response = await gitlabGet(
        `/projects?membership=true&min_access_level=30&simple=true&per_page=1${filter}`,
      );
      const total = response.headers.get('x-total');
      return total === null || total === '' ? null : Number(total);
    } catch {
      return null;
    }
  };
  const repos = await countProjects();
  if (repos === null) console.log('INFO  gitlab: repository counts not available with this token — skipped');
  const publicRepos = repos === null ? null : await countProjects('&visibility=public');
  const archivedRepos = repos === null ? null : await countProjects('&archived=true');
  const privateRepos = repos === null || publicRepos === null ? null : repos - publicRepos;

  return {
    fetchedAt: new Date().toISOString(),
    commits,
    contributions,
    pullRequests,
    issues,
    reviews,
    activeRepos: pushedProjects.size,
    activeProjects: contributedProjects.size,
    repos,
    publicRepos,
    privateRepos,
    archivedRepos,
    days,
  };
}


async function loadBaselines() {
  const baselines = [];

  try {
    baselines.push(JSON.parse(await readFile(OUT_FILES[0], 'utf8')));
  } catch {
  }

  const url = process.env.STATS_BASELINE_URL;
  if (url) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.ok) baselines.push(await response.json());
    } catch {
    }
  }

  return baselines;
}

function lastGood(baselines, source) {
  return baselines
    .map((baseline) => baseline?.sources?.[source])
    .filter((entry) => entry?.fetchedAt)
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0] ?? null;
}


async function main() {
  const to = new Date();
  const from = new Date(to.getTime() - 365 * DAY_MS);
  const baselines = await loadBaselines();

  const fetchers = { github: fetchGitHub, gitlab: fetchGitLab };
  const sources = {};

  for (const [name, fetcher] of Object.entries(fetchers)) {
    try {
      sources[name] = await fetcher(from, to);
      const source = sources[name];
      const privateNote =
        source.privateContributions === undefined ? '' : ` (+${source.privateContributions} private)`;
      console.log(
        `OK    ${name}: ${source.contributions} contributions, ${source.commits} commits${privateNote}, ` +
          `${source.pullRequests} PRs/MRs, ${source.issues} issues, ${source.reviews} reviews, ` +
          `${source.activeProjects} active projects (${source.activeRepos} with commits), ` +
          `${source.repos ?? 'n/a'} repos (${source.publicRepos ?? 'n/a'} public, ` +
          `${source.privateRepos ?? 'n/a'} private, ${source.archivedRepos ?? 'n/a'} archived), ` +
          `${Object.keys(source.days).length} active days`,
      );
    } catch (error) {
      const reason = error?.name === 'TimeoutError' ? 'request timed out (host unreachable?)' : error.message;
      const fallback = lastGood(baselines, name);
      sources[name] = fallback;
      warn(
        fallback
          ? `${name}: ${reason} — reusing data from ${fallback.fetchedAt.slice(0, 10)}`
          : `${name}: ${reason} — no earlier data to fall back on`,
      );
    }
  }

  const snapshot = {
    generatedAt: to.toISOString(),
    range: { from: isoDay(from), to: isoDay(to) },
    sources,
  };

  const json = `${JSON.stringify(snapshot, null, 2)}\n`;
  for (const file of OUT_FILES) {
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, json);
  }
  console.log(`Wrote ${OUT_FILES.map((file) => file.replace(`${ROOT}/`, '')).join(' and ')}`);
}

main().catch((error) => {
  warn(`stats fetch crashed: ${error.message}`);
});
