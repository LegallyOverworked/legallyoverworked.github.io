import raw from './stats.json';

export interface SourceStats {
  fetchedAt: string;
  commits: number;
  privateContributions?: number;
  contributions: number;
  pullRequests?: number;
  issues?: number;
  reviews?: number;
  newRepos?: number;
  activeRepos?: number;
  activeProjects?: number;
  publicRepos?: number | null;
  privateRepos?: number | null;
  archivedRepos?: number | null;
  repos: number | null;
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

export const commitCount = (source: SourceStats | null): number | null =>
  source ? source.commits + (source.privateContributions ?? 0) : null;

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
  longestStreak: number;
  currentStreak: number;
  busiestDay: { date: string; count: number } | null;
  busiestWeekday: string | null;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
