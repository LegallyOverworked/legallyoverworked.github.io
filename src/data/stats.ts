import raw from './stats.json';

/**
 * Counts-only activity snapshot written by scripts/fetch-stats.mjs
 * (daily, from the deploy workflow). A source is null until its first
 * successful fetch.
 */
export interface SourceStats {
  fetchedAt: string;
  commits: number;
  /** GitHub only: private activity reported as a bare count. */
  privateContributions?: number;
  contributions: number;
  /** Pull requests (GitHub) / merge requests (GitLab) opened. */
  pullRequests?: number;
  issues?: number;
  reviews?: number;
  /** GitHub only: repositories created. */
  newRepos?: number;
  /** Repositories that received commits. */
  activeRepos?: number;
  /** Repositories with any contribution (commit, pull/merge request, issue, review). */
  activeProjects?: number;
  publicRepos?: number | null;
  /** Everything that isn't public (on GitLab: private and internal). */
  privateRepos?: number | null;
  archivedRepos?: number | null;
  /** null when the token's scope doesn't allow counting repositories. */
  repos: number | null;
  /** ISO day (UTC) -> contribution count; days without activity are omitted. */
  days: Record<string, number>;
}

export interface ActivityStats {
  generatedAt: string | null;
  range: { from: string; to: string } | null;
  sources: {
    github: SourceStats | null;
    gitlab: SourceStats | null;
  };
}

export const activityStats = raw as unknown as ActivityStats;

/** Commits including private GitHub activity that is only available as a count. */
export const commitCount = (source: SourceStats | null): number | null =>
  source ? source.commits + (source.privateContributions ?? 0) : null;

/** Sum of an optional counter across the sources that report it; null if none do. */
export function sumField(
  stats: ActivityStats,
  field:
    | 'pullRequests'
    | 'issues'
    | 'reviews'
    | 'newRepos'
    | 'activeRepos'
    | 'activeProjects'
    | 'publicRepos'
    | 'privateRepos'
    | 'archivedRepos',
): number | null {
  const values = [stats.sources.github?.[field], stats.sources.gitlab?.[field]].filter(
    (value): value is number => typeof value === 'number',
  );
  return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
}

export interface ActivityRhythm {
  activeDays: number;
  /** Longest run of consecutive active days in the period. */
  longestStreak: number;
  /** Run of active days up to the latest synced day (0 if it has lapsed). */
  currentStreak: number;
  busiestDay: { date: string; count: number } | null;
  busiestWeekday: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/** Streaks and peaks over the synced period, combining both platforms. */
export function activityRhythm(stats: ActivityStats): ActivityRhythm | null {
  if (!stats.range) return null;
  const { github, gitlab } = stats.sources;
  if (!github && !gitlab) return null;

  const start = Date.parse(`${stats.range.from}T00:00:00Z`);
  const end = Date.parse(`${stats.range.to}T00:00:00Z`);
  const perWeekday = new Array<number>(7).fill(0);

  let activeDays = 0;
  let longestStreak = 0;
  let run = 0;
  let busiestDay: ActivityRhythm['busiestDay'] = null;
  let countToday = 0;
  let runBeforeToday = 0;

  for (let day = start; day <= end; day += DAY_MS) {
    const key = new Date(day).toISOString().slice(0, 10);
    const count = (github?.days[key] ?? 0) + (gitlab?.days[key] ?? 0);
    if (day === end) {
      runBeforeToday = run;
      countToday = count;
    }
    if (count > 0) {
      activeDays += 1;
      run += 1;
      longestStreak = Math.max(longestStreak, run);
      perWeekday[new Date(day).getUTCDay()] += count;
      if (!busiestDay || count > busiestDay.count) busiestDay = { date: key, count };
    } else {
      run = 0;
    }
  }

  // The latest day is usually still in progress when the data is synced,
  // so an empty "today" doesn't break a streak that ran through yesterday.
  const currentStreak = countToday > 0 ? run : runBeforeToday;
  const topWeekday = perWeekday.indexOf(Math.max(...perWeekday));

  return {
    activeDays,
    longestStreak,
    currentStreak,
    busiestDay,
    busiestWeekday: activeDays > 0 ? WEEKDAYS[topWeekday] : null,
  };
}
