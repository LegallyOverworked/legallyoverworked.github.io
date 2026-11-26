import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import type { ActivityStats } from '../data/stats';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKS = 53;
const CELL = 11;
const GAP = 3;
const DAY_LABEL_WIDTH = 30;

const LEVEL_CLASSES = [
  'bg-gray-200 dark:bg-gray-700/60',
  'bg-indigo-300 dark:bg-indigo-700',
  'bg-indigo-400 dark:bg-indigo-500',
  'bg-indigo-600 dark:bg-indigo-400',
  'bg-indigo-800 dark:bg-indigo-200',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const longDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});
const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

interface Cell {
  date: Date;
  github: number;
  gitlab: number;
  total: number;
  level: number;
}

interface Tooltip {
  index: number;
  cell: Cell;
  x: number;
  y: number;
}

const plural = (count: number, word: string) =>
  `${count.toLocaleString('en')} ${word}${count === 1 ? '' : 's'}`;

function buildCells(stats: ActivityStats): Cell[] {
  const { github, gitlab } = stats.sources;
  const end = stats.range ? new Date(`${stats.range.to}T00:00:00Z`) : new Date();
  const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const startDay = endDay - ((WEEKS - 1) * 7 + new Date(endDay).getUTCDay()) * DAY_MS;

  const cells: Cell[] = [];
  for (let day = startDay; day <= endDay; day += DAY_MS) {
    const date = new Date(day);
    const key = date.toISOString().slice(0, 10);
    const fromGithub = github?.days[key] ?? 0;
    const fromGitlab = gitlab?.days[key] ?? 0;
    cells.push({ date, github: fromGithub, gitlab: fromGitlab, total: fromGithub + fromGitlab, level: 0 });
  }

  const active = cells.map((cell) => cell.total).filter((total) => total > 0).sort((a, b) => a - b);
  if (active.length) {
    const quantile = (q: number) => active[Math.min(active.length - 1, Math.floor(q * active.length))];
    const thresholds = [quantile(0.25), quantile(0.5), quantile(0.75)];
    for (const cell of cells) {
      if (cell.total > 0) cell.level = 1 + thresholds.filter((threshold) => cell.total > threshold).length;
    }
  }
  return cells;
}

function updatedLabel(stats: ActivityStats): string | null {
  const { github, gitlab } = stats.sources;
  const githubDay = github ? shortDate.format(new Date(github.fetchedAt)) : null;
  const gitlabDay = gitlab ? shortDate.format(new Date(gitlab.fetchedAt)) : null;
  if (githubDay && gitlabDay) {
    return githubDay === gitlabDay
      ? `Updated ${githubDay}`
      : `GitHub updated ${githubDay} · GitLab updated ${gitlabDay}`;
  }
  const day = githubDay ?? gitlabDay;
  return day ? `Updated ${day}` : null;
}

function sourcesLabel(stats: ActivityStats): string {
  const { github, gitlab } = stats.sources;
  if (github && !gitlab) return 'GitHub only · GitLab not synced yet';
  if (gitlab && !github) return 'GitLab only · GitHub not synced yet';
  return 'GitHub + GitLab';
}

export default function ContributionHeatmap({ stats }: { stats: ActivityStats }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const cells = useMemo(() => buildCells(stats), [stats]);
  const total = useMemo(() => cells.reduce((sum, cell) => sum + cell.total, 0), [cells]);
  const hasData = Boolean(stats.sources.github || stats.sources.gitlab);
  const hasBothSources = Boolean(stats.sources.github && stats.sources.gitlab);
  const coverage = hasBothSources ? 'across GitHub and GitLab' : stats.sources.github ? 'on GitHub' : 'on GitLab';
  const updated = updatedLabel(stats);

  const monthLabels = useMemo(() => {
    const labels: { column: number; label: string }[] = [];
    for (let column = 0; column * 7 < cells.length; column++) {
      const month = cells[column * 7].date.getUTCMonth();
      const previous = column > 0 ? cells[(column - 1) * 7].date.getUTCMonth() : -1;
      const last = labels[labels.length - 1];
      if (month !== previous && (!last || column - last.column >= 3)) {
        labels.push({ column, label: MONTHS[month] });
      }
    }
    return labels;
  }, [cells]);

  useEffect(() => {
    const element = scrollRef.current;
    if (element) element.scrollLeft = element.scrollWidth;
  }, []);

  const showTooltip = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const pitch = CELL + GAP;
    const column = Math.floor((event.clientX - rect.left + GAP / 2) / pitch);
    const row = Math.min(6, Math.max(0, Math.floor((event.clientY - rect.top + GAP / 2) / pitch)));
    const index = column * 7 + row;
    if (column < 0 || index >= cells.length) {
      setTooltip(null);
      return;
    }
    if (tooltip?.index === index) return;
    const x = rect.left + column * pitch + CELL / 2;
    setTooltip({
      index,
      cell: cells[index],
      x: Math.min(Math.max(x, 100), window.innerWidth - 100),
      y: rect.top + row * pitch,
    });
  };

  const gridColumns = `repeat(${WEEKS}, ${CELL}px)`;

  return (
    <section
      className="relative mt-8 w-full max-w-4xl"
      aria-label="Combined GitHub and GitLab contribution activity"
    >
      <div className="absolute -inset-1 bg-gradient-to-r from-brand-700 to-accent-500 dark:from-brand-500 dark:to-accent-400 rounded-xl blur opacity-20" />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 mb-3">
          <h3 className="text-sm text-gray-600 dark:text-gray-400">
            {hasData ? (
              <>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                  {total.toLocaleString('en')}
                </span>{' '}
                contributions in the last year
              </>
            ) : (
              'Contribution activity'
            )}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">{sourcesLabel(stats)}</span>
        </div>

        <div ref={scrollRef} className="overflow-x-auto pb-1">
          <div className="w-max mx-auto">
            <div
              className="grid text-[10px] leading-none text-gray-500 dark:text-gray-400 h-4"
              style={{ gridTemplateColumns: gridColumns, columnGap: GAP, marginLeft: DAY_LABEL_WIDTH }}
              aria-hidden="true"
            >
              {monthLabels.map(({ column, label }) => (
                <span key={column} className="whitespace-nowrap" style={{ gridColumnStart: column + 1 }}>
                  {label}
                </span>
              ))}
            </div>

            <div className="flex">
              <div
                className="grid text-[10px] leading-none text-gray-500 dark:text-gray-400 shrink-0"
                style={{ gridTemplateRows: `repeat(7, ${CELL}px)`, rowGap: GAP, width: DAY_LABEL_WIDTH }}
                aria-hidden="true"
              >
                {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((day, index) => (
                  <span key={index} className="flex items-center">
                    {day}
                  </span>
                ))}
              </div>

              <div
                role="img"
                aria-label={
                  hasData
                    ? `${plural(total, 'contribution')} ${coverage} in the last year`
                    : 'Contribution data is not available yet'
                }
                className="grid grid-flow-col"
                style={{
                  gridTemplateRows: `repeat(7, ${CELL}px)`,
                  gridAutoColumns: CELL,
                  gap: GAP,
                }}
                onMouseMove={showTooltip}
                onMouseLeave={() => setTooltip(null)}
                onClick={showTooltip}
              >
                {cells.map((cell, index) => (
                  <div key={index} className={`rounded-sm ${LEVEL_CLASSES[cell.level]}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 mt-3 text-xs text-gray-500 dark:text-gray-400">
          <span>{updated ?? 'Live data appears after the first daily sync.'}</span>
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="mr-1">Less</span>
            {LEVEL_CLASSES.map((levelClass) => (
              <span
                key={levelClass}
                className={`rounded-sm ${levelClass}`}
                style={{ width: CELL, height: CELL }}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>

      {tooltip && (
        <div
          role="tooltip"
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          <div className="font-semibold">
            {tooltip.cell.total > 0 ? plural(tooltip.cell.total, 'contribution') : 'No contributions'}
          </div>
          <div className="text-gray-300">{longDate.format(tooltip.cell.date)}</div>
          {tooltip.cell.total > 0 && hasBothSources && (
            <div className="mt-1 text-gray-300">
              GitHub {tooltip.cell.github.toLocaleString('en')} · GitLab{' '}
              {tooltip.cell.gitlab.toLocaleString('en')}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
