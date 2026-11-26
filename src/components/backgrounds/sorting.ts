import { clamp, dot, ease, flanks, line, mixRgb, rgbStr, rng, roundedRect, strandA } from './draw';
import type { Scene } from './types';

interface Step {
  swap: boolean;
  i: number;
  j: number;
  mark: number;
}

const COUNT = 16;
const STEPS_PER_SECOND = 3.5;
const LEAD_IN = 0.8;
const AFTER = 3.4;
const SHUFFLE_TIME = 1.2;

const exchange = (a: number[], i: number, j: number) => {
  const x = a[i];
  a[i] = a[j];
  a[j] = x;
};

function insertionSort(input: number[]): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  for (let i = 1; i < a.length; i += 1) {
    for (let j = i; j > 0; j -= 1) {
      if (a[j - 1] > a[j]) {
        steps.push({ swap: true, i: j - 1, j, mark: i });
        exchange(a, j - 1, j);
      } else {
        steps.push({ swap: false, i: j - 1, j, mark: i });
        break;
      }
    }
  }
  return steps;
}

function quickSort(input: number[]): Step[] {
  const a = input.slice();
  const steps: Step[] = [];
  const sort = (lo: number, hi: number) => {
    if (lo >= hi) return;
    const pivot = a[hi];
    let boundary = lo;
    for (let j = lo; j < hi; j += 1) {
      if (a[j] < pivot && boundary !== j) {
        steps.push({ swap: true, i: boundary, j, mark: hi });
        exchange(a, boundary, j);
      } else {
        steps.push({ swap: false, i: j, j: hi, mark: hi });
      }
      if (a[boundary] < pivot) boundary += 1;
    }
    if (boundary !== hi) {
      steps.push({ swap: true, i: boundary, j: hi, mark: hi });
      exchange(a, boundary, hi);
    }
    sort(lo, boundary - 1);
    sort(boundary + 1, hi);
  };
  sort(0, a.length - 1);
  return steps;
}

const ALGORITHMS = [
  { name: 'insertion sort', run: insertionSort },
  { name: 'quicksort', run: quickSort },
];

const ROUNDS = (() => {
  const r = rng(91);
  return Array.from({ length: 3 }, () => {
    const start = Array.from({ length: COUNT }, (_, i) => i);
    for (let i = COUNT - 1; i > 0; i -= 1) exchange(start, i, Math.floor(r() * (i + 1)));
    return { start, steps: ALGORITHMS.map((algorithm) => algorithm.run(start)) };
  });
})();
const LONGEST = Math.max(...ROUNDS.flatMap((round) => round.steps.map((steps) => steps.length)));
const CYCLE = LEAD_IN + LONGEST / STEPS_PER_SECOND + AFTER;

export const sorting: Scene = {
  still: 9,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const epoch = Math.max(0, Math.floor(t / CYCLE));
    const tt = Math.max(0, t - epoch * CYCLE);
    const round = ROUNDS[epoch % ROUNDS.length];
    const upcoming = ROUNDS[(epoch + 1) % ROUNDS.length];
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const base = cy + h * 0.29;
    const tallest = h * 0.5;
    const reshuffle = ease((tt - (CYCLE - SHUFFLE_TIME)) / (SHUFFLE_TIME - 0.1));

    flanks(w, dead).forEach(([x0, x1], side) => {
      const steps = round.steps[side];
      const span = x1 - x0;
      const slot = span / COUNT;
      const barWidth = Math.max(2, slot * 0.62);
      const progress = clamp(((tt - LEAD_IN) * STEPS_PER_SECOND) / steps.length) * steps.length;
      const completed = Math.min(steps.length, Math.floor(progress));
      const within = progress - completed;
      const order = round.start.slice();
      for (let n = 0; n < completed; n += 1) if (steps[n].swap) exchange(order, steps[n].i, steps[n].j);
      const current = completed < steps.length ? steps[completed] : null;
      const finishedAt = LEAD_IN + steps.length / STEPS_PER_SECOND;
      const rgb = strandA(pal, x0 / w);

      line(ctx, x0 - 2, base + 1, x1 + 2, base + 1, rgb, 0.4);
      for (let i = 0; i < COUNT; i += 1) {
        let x = x0 + (i + 0.5) * slot;
        let lift = 0;
        let state = 0;
        if (current && (i === current.i || i === current.j)) {
          state = current.swap ? 2 : 1;
          if (current.swap) {
            const other = i === current.i ? current.j : current.i;
            const moved = ease(within);
            x += (other - i) * slot * moved;
            lift = Math.sin(Math.PI * moved) * h * 0.03;
          }
        }
        const value = current ? order[i] : order[i] + (upcoming.start[i] - order[i]) * reshuffle;
        const height = (0.12 + (0.88 * (value + 1)) / COUNT) * tallest;
        const sweep = current ? 0 : clamp(1 - Math.abs((tt - finishedAt) * 1.6 - (i / COUNT) * 1.4) * 2.5);
        const placed = current !== null && side === 0 && i < current.mark;
        const colour = state === 2 ? accent : mixRgb(pal.a0, pal.b1, value / (COUNT - 1));
        const alpha = state === 2 ? 0.9 : state === 1 ? 0.85 : (placed ? 0.6 : 0.42) + 0.45 * sweep;
        ctx.fillStyle = `rgba(${colour},${alpha})`;
        roundedRect(ctx, x - barWidth / 2, base - height - lift, barWidth, height, Math.min(3, barWidth / 2));
        ctx.fill();
        if (state === 1) {
          ctx.strokeStyle = `rgba(${ink},0.9)`;
          ctx.lineWidth = 1.3;
          roundedRect(ctx, x - barWidth / 2 - 1.5, base - height - 1.5, barWidth + 3, height + 3, Math.min(4, barWidth / 2 + 1));
          ctx.stroke();
        }
        if (state) dot(ctx, x, base + 7, 1.8, state === 2 ? accent : ink, 0.9);
        if (current && side === 1 && i === current.mark) line(ctx, x - barWidth / 2, base + 12, x + barWidth / 2, base + 12, ink, 0.8, 2);
      }

      const top = cy - h * 0.27;
      ctx.font = '500 11px ui-monospace,SFMono-Regular,Menlo,monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = `rgba(${rgb},0.75)`;
      ctx.fillText(ALGORITHMS[side].name, x0, top - 6);
      line(ctx, x0, top, x1, top, rgb, 0.25, 2);
      line(ctx, x0, top, x0 + span * clamp(progress / steps.length), top, current ? accent : ink, 0.8, 2);
    });
  },
};
