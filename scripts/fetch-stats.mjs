#!/usr/bin/env node
/**
 * Fetches a year of GitHub + GitLab activity and writes a counts-only snapshot
 * that the homepage reads (heatmap + live stat chips).
 *
 * Privacy: the snapshot and the logs contain per-day counts and totals only —
 * never repository names, commit messages or usernames.
 *
 * Fail-soft: if a source cannot be fetched, its last good data is reused
 * (from the deployed site or the committed snapshot). This script never exits
 * non-zero, so a failing API can't break a deploy.
 *
 * Env:
 *   GH_STATS_TOKEN       GitHub token (read-only)
 *   GITLAB_STATS_TOKEN   GitLab token (read_user is enough; cannot read code)
 *   GITLAB_URL           GitLab base URL (default: https://gitlab.kuleuven.be)
 *   STATS_BASELINE_URL   Optional URL of the last deployed stats.json
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_FILES = [
  resolve(ROOT, 'src/data/stats.json'), // imported by the app at build time
  resolve(ROOT, 'public/stats.json'), // served, so the next run can use it as a baseline
];
const REQUEST_TIMEOUT_MS = 20_000;
const DAY_MS = 24 * 60 * 60 * 1000;

// Local runs: pick up tokens from an untracked .env file if there is one.
try {
  process.loadEnvFile?.(resolve(ROOT, '.env'));
} catch {
  /* no .env file — rely on the real environment */
}

const GITLAB_URL = (process.env.GITLAB_URL || 'https://gitlab.kuleuven.be').replace(/\/+$/, '');

const isoDay = (date) => date.toISOString().slice(0, 10);
const warn = (message) =>
  console.log(process.env.GITHUB_ACTIONS ? `::warning::${message}` : `WARN  ${message}`);

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
}

/* ------------------------------- GitHub -------------------------------- */

async function fetchGitHub(from, to) {
  const token = process.env.GH_STATS_TOKEN;
  if (!token) throw new Error('GH_STATS_TOKEN is not set');

  const query = `
    query ($from: DateTime!, $to: DateTime!) {
      viewer {
        contributionsCollection(from: $from, to: $to) {
          totalCommitContributions
          restrictedContributionsCount
          contributionCalendar {
            totalContributions
            weeks { contributionDays { date contributionCount } }
          }
        }
        repositories(ownerAffiliations: OWNER, isFork: false) { totalCount }
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

  const { contributionsCollection: collection, repositories } = payload.data.viewer;
  const days = {};
  for (const week of collection.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > 0) days[day.date] = day.contributionCount;
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    // Commits GitHub can attribute, plus private activity it only reports as a count.
    commits: collection.totalCommitContributions,
    privateContributions: collection.restrictedContributionsCount,
    contributions: collection.contributionCalendar.totalContributions,
    repos: repositories.totalCount,
    days,
  };
}

/* ------------------------------- GitLab -------------------------------- */

async function gitlabGet(path) {
  const token = process.env.GITLAB_STATS_TOKEN;
  if (!token) throw new Error('GITLAB_STATS_TOKEN is not set');

  const response = await fetchWithTimeout(`${GITLAB_URL}/api/v4${path}`, {
    headers: { 'PRIVATE-TOKEN': token, 'User-Agent': 'portfolio-stats-fetcher' },
  });
  if (!response.ok) throw new Error(`GitLab API responded with HTTP ${response.status}`);
  return response;
}

// Mirrors what GitHub counts as a contribution: commits, opened issues/MRs, reviews.
const GITLAB_COUNTED_TARGETS = new Set(['Issue', 'MergeRequest', 'WorkItem']);
const GITLAB_COUNTED_ACTIONS = new Set(['opened', 'approved']);

async function fetchGitLab(from, to) {
  const after = isoDay(new Date(from.getTime() - DAY_MS)); // `after` is exclusive
  const before = isoDay(new Date(to.getTime() + DAY_MS)); // `before` is exclusive
  const fromDay = isoDay(from);

  const days = {};
  let commits = 0;
  let contributions = 0;
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
        }
      } else if (
        GITLAB_COUNTED_TARGETS.has(event.target_type) &&
        GITLAB_COUNTED_ACTIONS.has(event.action_name)
      ) {
        count = 1;
      }

      if (count > 0) {
        days[day] = (days[day] || 0) + count;
        contributions += count;
      }
    }

    page = response.headers.get('x-next-page') || '';
  }

  // Projects the token owner can contribute to (Developer role or higher).
  // Optional: listing projects needs the `read_api` scope, which can also read
  // code. With a `read_user`-only token this is skipped and the site keeps its
  // hand-set GitLab repository number.
  let repos = null;
  try {
    const projects = await gitlabGet('/projects?membership=true&min_access_level=30&simple=true&per_page=1');
    repos = Number(projects.headers.get('x-total')) || null;
  } catch {
    console.log('INFO  gitlab: repository count not available with this token scope — skipped');
  }

  return { fetchedAt: new Date().toISOString(), commits, contributions, repos, days };
}

/* ------------------------------ Baselines ------------------------------ */

async function loadBaselines() {
  const baselines = [];

  try {
    baselines.push(JSON.parse(await readFile(OUT_FILES[0], 'utf8')));
  } catch {
    /* no committed snapshot yet */
  }

  const url = process.env.STATS_BASELINE_URL;
  if (url) {
    try {
      const response = await fetchWithTimeout(url);
      if (response.ok) baselines.push(await response.json());
    } catch {
      /* site not deployed yet, or unreachable */
    }
  }

  return baselines;
}

/** Newest previously fetched data for one source, or null. */
function lastGood(baselines, source) {
  return baselines
    .map((baseline) => baseline?.sources?.[source])
    .filter((entry) => entry?.fetchedAt)
    .sort((a, b) => b.fetchedAt.localeCompare(a.fetchedAt))[0] ?? null;
}

/* -------------------------------- Main --------------------------------- */

async function main() {
  const to = new Date();
  const from = new Date(to.getTime() - 365 * DAY_MS);
  const baselines = await loadBaselines();

  const fetchers = { github: fetchGitHub, gitlab: fetchGitLab };
  const sources = {};

  for (const [name, fetcher] of Object.entries(fetchers)) {
    try {
      sources[name] = await fetcher(from, to);
      const { commits, contributions, repos, privateContributions } = sources[name];
      const privateNote = privateContributions === undefined ? '' : ` (+${privateContributions} private)`;
      console.log(
        `OK    ${name}: ${contributions} contributions, ${commits} commits${privateNote}, ${repos ?? "n/a"} repos, ` +
          `${Object.keys(sources[name].days).length} active days`,
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
  // Never fail the deploy over statistics.
  warn(`stats fetch crashed: ${error.message}`);
});
