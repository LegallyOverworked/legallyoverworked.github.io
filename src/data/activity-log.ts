/**
 * Hand-kept log behind the weekly panels under the contribution heatmap.
 *
 * Add one entry per item. The panels group entries into weeks over the same
 * last-year window as the heatmap; anything older (or dated in the future) is
 * kept here but not shown. Titles appear in the hover tooltip.
 *
 * In production a panel is hidden until it has an entry in that window; the
 * dev server always shows all three.
 */
export interface LogEntry {
  /** ISO day: YYYY-MM-DD. */
  date: string;
  /** Shown in the tooltip; optional for posts. */
  title?: string;
}

/** Articles, blog posts and project write-ups. */
export const writing: LogEntry[] = [
  // { date: '2026-10-14', title: 'Example title' },
];

/** Talks, presentations and posters. */
export const speaking: LogEntry[] = [
  // { date: '2026-05-21', title: 'Example talk · Example venue' },
];

/** Social posts. */
export const posts: LogEntry[] = [
  // { date: '2026-11-03', title: 'Example post' },
];
