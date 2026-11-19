import { useMemo, useState } from 'react';
import type { ComponentType, MouseEvent } from 'react';
import { MessageSquare, PenLine, Presentation } from 'lucide-react';
import type { LogEntry } from '../data/activity-log';
import { posts, speaking, writing } from '../data/activity-log';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const WEEKS = 53; // the same window as the daily heatmap above
const ROWS = 5; // a month holds at most five week starts
const CELL = 14; // px
const GAP = 4; // px
const PITCH = CELL + GAP;
const TOOLTIP_HALF_WIDTH = 136; // px; keeps the fixed tooltip on screen

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

interface Panel {
  key: string;
  title: string;
  /** Singular noun for one entry, e.g. "talk". */
  noun: string;
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  /** One hue, light -> dark (reversed on the dark surface), level 0..4. */
  levels: string[];
  entries: LogEntry[];
}

const PANELS: Panel[] = [
  {
    key: 'writing',
    title: 'Writing',
    noun: 'article',
    icon: PenLine,
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    levels: [
      'bg-gray-200 dark:bg-gray-700/60',
      'bg-emerald-300 dark:bg-emerald-800',
      'bg-emerald-400 dark:bg-emerald-600',
      'bg-emerald-600 dark:bg-emerald-400',
      'bg-emerald-800 dark:bg-emerald-200',
    ],
    entries: writing,
  },
  {
    key: 'speaking',
    title: 'Speaking',
    noun: 'talk',
    icon: Presentation,
    iconClass: 'text-purple-600 dark:text-purple-400',
    levels: [
      'bg-gray-200 dark:bg-gray-700/60',
      'bg-purple-300 dark:bg-purple-800',
      'bg-purple-400 dark:bg-purple-600',
      'bg-purple-600 dark:bg-purple-400',
      'bg-purple-800 dark:bg-purple-200',
    ],
    entries: speaking,
  },
  {
    key: 'posts',
    title: 'Posts',
    noun: 'post',
    icon: MessageSquare,
    iconClass: 'text-sky-600 dark:text-sky-400',
    levels: [
      'bg-gray-200 dark:bg-gray-700/60',
      'bg-sky-300 dark:bg-sky-800',
      'bg-sky-400 dark:bg-sky-600',
      'bg-sky-600 dark:bg-sky-400',
      'bg-sky-800 dark:bg-sky-200',
    ],
    entries: posts,
  },
];

// Tailwind only ships class names it can see in full.
const LG_COLUMNS = ['', 'lg:grid-cols-1', 'lg:grid-cols-2', 'lg:grid-cols-3'];

interface Week {
  /** UTC midnight of the week's Sunday. */
  start: number;
  /** One column per calendar month, in order. */
  column: number;
  /** Which week of its month (0-4), by the day the week starts. */
  row: number;
  entries: LogEntry[];
  level: number;
}

interface WeekRange {
  startDay: number;
  endDay: number;
}

interface Tooltip {
  week: Week;
  x: number;
  y: number;
}

const plural = (count: number, word: string) =>
  `${count.toLocaleString('en')} ${word}${count === 1 ? '' : 's'}`;

const parseDay = (iso: string) => (/^\d{4}-\d{2}-\d{2}$/.test(iso) ? Date.parse(`${iso}T00:00:00Z`) : NaN);

/**
 * The same 53 Sunday-start weeks as ContributionHeatmap's buildCells, so a
 * date falls in the same week in every view on the page.
 */
function weekWindow(endIso: string | null): WeekRange {
  const end = endIso ? new Date(`${endIso}T00:00:00Z`) : new Date();
  const endDay = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const startDay = endDay - ((WEEKS - 1) * 7 + new Date(endDay).getUTCDay()) * DAY_MS;
  return { startDay, endDay };
}

function buildWeeks(entries: LogEntry[], { startDay, endDay }: WeekRange): Week[] {
  const weeks: Week[] = [];
  let column = -1;
  let previousMonth = -1;
  for (let index = 0; index < WEEKS; index++) {
    const start = startDay + index * WEEK_MS;
    const date = new Date(start);
    const month = date.getUTCFullYear() * 12 + date.getUTCMonth();
    if (month !== previousMonth) {
      column += 1;
      previousMonth = month;
    }
    weeks.push({ start, column, row: Math.floor((date.getUTCDate() - 1) / 7), entries: [], level: 0 });
  }

  for (const entry of entries) {
    const day = parseDay(entry.date);
    if (Number.isNaN(day) || day < startDay || day > endDay) continue;
    weeks[Math.floor((day - startDay) / WEEK_MS)].entries.push(entry);
  }

  // Up to four a week, the count is the shade (1 entry = level 1 ... 4 = level 4).
  // Busier logs scale linearly to the busiest week (quartiles tie on small counts).
  const max = Math.max(...weeks.map((week) => week.entries.length));
  for (const week of weeks) {
    const count = week.entries.length;
    week.level = max <= 4 ? count : count === 0 ? 0 : Math.max(1, Math.ceil((count / max) * 4));
  }
  return weeks;
}

/** Most recent entry up to the end of the window, even if older than a year. */
function latestEntry(entries: LogEntry[], endDay: number): string | null {
  let latest = -Infinity;
  for (const entry of entries) {
    const day = parseDay(entry.date);
    if (!Number.isNaN(day) && day <= endDay && day > latest) latest = day;
  }
  return Number.isFinite(latest) ? shortDate.format(new Date(latest)) : null;
}

function WeekPanel({ panel, weeks, endDay }: { panel: Panel; weeks: Week[]; endDay: number }) {
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const columns = weeks[weeks.length - 1].column + 1;
  const total = weeks.reduce((sum, week) => sum + week.entries.length, 0);
  const latest = useMemo(() => latestEntry(panel.entries, endDay), [panel.entries, endDay]);
  const Icon = panel.icon;

  const byPosition = useMemo(() => new Map(weeks.map((week) => [`${week.column}:${week.row}`, week])), [weeks]);

  // Label every other month, counting back from the current one, so labels never collide.
  const monthLabels = useMemo(() => {
    const labels: { column: number; label: string }[] = [];
    for (const week of weeks) {
      const isFirstOfColumn = labels.length === 0 || labels[labels.length - 1].column !== week.column;
      if (isFirstOfColumn) labels.push({ column: week.column, label: MONTHS[new Date(week.start).getUTCMonth()] });
    }
    return labels.filter(({ column }) => (columns - 1 - column) % 2 === 0);
  }, [weeks, columns]);

  // Resolve the week from the pointer position (by column and row, since months have 4 or 5 weeks).
  const showTooltip = (event: MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const column = Math.floor((event.clientX - rect.left + GAP / 2) / PITCH);
    const row = Math.floor((event.clientY - rect.top + GAP / 2) / PITCH);
    const week = byPosition.get(`${column}:${row}`);
    if (!week) {
      setTooltip(null);
      return;
    }
    if (tooltip?.week === week) return;
    const x = rect.left + column * PITCH + CELL / 2;
    setTooltip({
      week,
      x: Math.min(Math.max(x, TOOLTIP_HALF_WIDTH), window.innerWidth - TOOLTIP_HALF_WIDTH),
      y: rect.top + row * PITCH,
    });
  };

  const inWindow = weeks.flatMap((week) => week.entries);
  const titled = tooltip ? tooltip.week.entries.filter((entry) => entry.title) : [];

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-20" />
      <div className="relative h-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-5 flex flex-col">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {panel.title}
          </h3>
          <Icon className={`h-4 w-4 ${panel.iconClass}`} />
        </div>
        <p className="mt-1 mb-3 text-sm text-gray-600 dark:text-gray-400">
          <span className="text-base font-semibold text-gray-900 dark:text-white">{total.toLocaleString('en')}</span>{' '}
          {total === 1 ? panel.noun : `${panel.noun}s`} in the last year
        </p>

        <div className="w-max mx-auto">
          <div
            className="grid text-[10px] leading-none text-gray-500 dark:text-gray-400 h-4"
            style={{ gridTemplateColumns: `repeat(${columns}, ${CELL}px)`, columnGap: GAP }}
            aria-hidden="true"
          >
            {monthLabels.map(({ column, label }) => (
              <span key={column} className="whitespace-nowrap" style={{ gridColumnStart: column + 1 }}>
                {label}
              </span>
            ))}
          </div>

          <div
            role="img"
            aria-label={`${plural(total, panel.noun)} in the last year, by week`}
            className="grid"
            style={{
              gridTemplateColumns: `repeat(${columns}, ${CELL}px)`,
              gridTemplateRows: `repeat(${ROWS}, ${CELL}px)`,
              gap: GAP,
            }}
            onMouseMove={showTooltip}
            onMouseLeave={() => setTooltip(null)}
            onClick={showTooltip}
          >
            {weeks.map((week) => (
              <div
                key={week.start}
                className={`rounded-sm ${panel.levels[week.level]} ${
                  tooltip?.week === week ? 'outline outline-1 outline-gray-900/60 dark:outline-white/70' : ''
                }`}
                style={{ gridColumnStart: week.column + 1, gridRowStart: week.row + 1 }}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 text-xs text-gray-500 dark:text-gray-400">
          <span>
            {latest
              ? `Latest ${latest}`
              : import.meta.env.DEV
                ? 'Dev only: add entries in src/data/activity-log.ts'
                : 'Nothing logged yet'}
          </span>
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="mr-1">Less</span>
            {panel.levels.map((levelClass) => (
              <span key={levelClass} className={`rounded-sm ${levelClass}`} style={{ width: 10, height: 10 }} />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>

        {inWindow.length > 0 && (
          <ul className="sr-only">
            {inWindow.map((entry, index) => (
              <li key={index}>
                {shortDate.format(new Date(parseDay(entry.date)))}: {entry.title ?? panel.noun}
              </li>
            ))}
          </ul>
        )}
      </div>

      {tooltip && (
        <div
          role="tooltip"
          className="fixed z-50 pointer-events-none -translate-x-1/2 -translate-y-full w-max max-w-[260px] rounded-lg bg-gray-900 dark:bg-gray-700 px-3 py-2 text-xs text-white shadow-lg"
          style={{ left: tooltip.x, top: tooltip.y - 6 }}
        >
          <div className="font-semibold">
            {tooltip.week.entries.length > 0
              ? plural(tooltip.week.entries.length, panel.noun)
              : `No ${panel.noun}s`}
          </div>
          <div className="text-gray-300">Week of {shortDate.format(new Date(tooltip.week.start))}</div>
          {titled.slice(0, 3).map((entry, index) => (
            <div key={index} className="mt-1 truncate">
              {entry.title}
            </div>
          ))}
          {titled.length > 3 && <div className="mt-1 text-gray-300">+{titled.length - 3} more</div>}
        </div>
      )}
    </div>
  );
}

/**
 * Three weekly heatmaps (writing, speaking, posts) on the heatmap's time axis.
 * Pass the heatmap's end day (stats.range.to) so both views cover the same weeks.
 */
export default function WeeklyActivity({ end }: { end: string | null }) {
  const range = useMemo(() => weekWindow(end), [end]);
  const panels = useMemo(
    () => PANELS.map((panel) => ({ panel, weeks: buildWeeks(panel.entries, range) })),
    [range],
  );

  // In production, an empty panel is left out rather than shown as zero.
  const visible = panels.filter(
    ({ weeks }) => import.meta.env.DEV || weeks.some((week) => week.entries.length > 0),
  );
  if (!visible.length) return null;

  return (
    <section
      className={`mt-6 grid w-full max-w-4xl grid-cols-1 gap-4 ${LG_COLUMNS[visible.length]}`}
      aria-label="Writing, speaking and posts by week"
    >
      {visible.map(({ panel, weeks }) => (
        <WeekPanel key={panel.key} panel={panel} weeks={weeks} endDay={range.endDay} />
      ))}
    </section>
  );
}
