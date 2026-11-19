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
