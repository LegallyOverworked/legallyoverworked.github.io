import { clamp, dot, ease, flanks, hash, line, mixRgb, rgbStr, ring, strandA } from './draw';
import type { Scene } from './types';

type Point = [number, number];
type Optimum = [x: number, y: number, size: number, width: number];

interface View {
  depth: number;
  height: number;
  shift: number;
}

interface Run {
  shared: Point[];
  onward: Point[];
}

const COLS = 48;
const ROWS = 36;
const LEVELS = 13;
const CLIMB_RATE = 0.02;
const CLIMB_STEPS = 320;
const ARRIVED = 0.12;
const SPACING = 0.012;
const STARTS = 24;

const gridX = (i: number) => -1 + (2 * i) / COLS;
const gridY = (j: number) => -1 + (2 * j) / ROWS;

function resample(points: Point[]): Point[] {
  const out: Point[] = [points[0]];
  let carried = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let at = SPACING - carried;
    while (at <= length) {
      out.push([a[0] + ((b[0] - a[0]) * at) / length, a[1] + ((b[1] - a[1]) * at) / length]);
      at += SPACING;
    }
    carried = (carried + length) % SPACING;
  }
  out.push(points[points.length - 1]);
  return out;
}

function buildLandscape(direction: 1 | -1, optima: Optimum[], view: View) {
  const relief = (x: number, y: number) => {
    let v = -0.22 * (x * x + y * y);
    for (const [ox, oy, size, width] of optima) v += size * Math.exp(-((x - ox) ** 2 + (y - oy) ** 2) / width);
    return v;
  };
  const z = (x: number, y: number) => direction * relief(x, y) + 0.03 * Math.sin(4 * x + 1) * Math.cos(3.5 * y);

  const improve = (from: Point): Point[] => {
    const path: Point[] = [from];
    let [x, y] = from;
    const e = 0.01;
    for (let i = 0; i < CLIMB_STEPS; i += 1) {
      x += CLIMB_RATE * direction * ((z(x + e, y) - z(x - e, y)) / (2 * e));
      y += CLIMB_RATE * direction * ((z(x, y + e) - z(x, y - e)) / (2 * e));
      path.push([x, y]);
    }
    return path;
  };
  const reached = (p: Point, o: Optimum) => Math.hypot(p[0] - o[0], p[1] - o[1]) < ARRIVED;

  const [best, ...lesser] = optima;
  const runs: Run[] = [];
  for (let k = 0; k < STARTS; k += 1) {
    const angle = (k / STARTS) * Math.PI * 2 + 0.15;
    const greedy = improve([0.92 * Math.cos(angle), 0.92 * Math.sin(angle)]);
    const end = greedy[greedy.length - 1];
    const trap = lesser.find((o) => reached(end, o));
    if (!trap) continue;
    for (let u = 0.1; u <= 1.0001; u += 0.05) {
      const exit: Point = [end[0] + (best[0] - end[0]) * u, end[1] + (best[1] - end[1]) * u];
      const rest = improve(exit);
      if (!reached(rest[rest.length - 1], best)) continue;
      runs.push({ shared: resample(greedy), onward: resample([end, ...rest]) });
      break;
    }
  }

  const heights: number[][] = [];
  let low = Infinity;
  let high = -Infinity;
  for (let j = 0; j <= ROWS; j += 1) {
    heights.push([]);
    for (let i = 0; i <= COLS; i += 1) {
      const v = z(gridX(i), gridY(j));
      heights[j].push(v);
      low = Math.min(low, v);
      high = Math.max(high, v);
    }
  }
  const levels = Array.from({ length: LEVELS }, (_, k) => low + ((k + 1) / (LEVELS + 1)) * (high - low));

  const rings: number[][][] = [];
  for (let j = 0; j < ROWS; j += 1) {
    const strip: number[][] = levels.map(() => []);
    for (let i = 0; i < COLS; i += 1) {
      const corners: [number, number, number][] = [
        [gridX(i), gridY(j), heights[j][i]],
        [gridX(i + 1), gridY(j), heights[j][i + 1]],
        [gridX(i + 1), gridY(j + 1), heights[j + 1][i + 1]],
        [gridX(i), gridY(j + 1), heights[j + 1][i]],
      ];
      levels.forEach((level, k) => {
        const crossings: number[] = [];
        for (let c = 0; c < 4; c += 1) {
          const a = corners[c];
          const b = corners[(c + 1) % 4];
          if ((a[2] - level) * (b[2] - level) >= 0) continue;
          const f = (level - a[2]) / (b[2] - a[2]);
          crossings.push(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
        }
        if (crossings.length >= 4) strip[k].push(crossings[0], crossings[1], crossings[2], crossings[3]);
        if (crossings.length === 8) strip[k].push(crossings[4], crossings[5], crossings[6], crossings[7]);
      });
    }
    rings.push(strip);
  }

  return { z, best, runs, heights, levels, rings, low, high, view, direction };
}

const LANDSCAPES = [
  buildLandscape(
    -1,
    [
      [0.3, 0.3, 0.85, 0.12],
      [-0.55, 0.25, 0.55, 0.05],
      [-0.15, -0.45, 0.5, 0.05],
      [0.62, -0.35, 0.48, 0.045],
      [-0.72, -0.5, 0.35, 0.04],
    ],
    { depth: 0.22, height: 0.11, shift: 0.03 },
  ),
  buildLandscape(
    1,
    [
      [-0.25, -0.4, 1, 0.1],
      [0.5, 0.3, 0.58, 0.05],
      [-0.6, 0.35, 0.5, 0.05],
      [0.65, -0.35, 0.45, 0.045],
      [0.05, 0.6, 0.4, 0.04],
    ],
    { depth: 0.18, height: 0.18, shift: 0 },
  ),
];
const CAPTIONS = ['minimise', 'maximise'];

const CYCLE = 16;
const START = 0.8;
const SHARED_TIME = 5.2;
const PAUSE = 0.7;
const ONWARD_TIME = 5.6;
const FADE = 0.8;

export const landscape: Scene = {
  still: 13,
  draw(ctx, w, h, t, pal, dead) {
    const epoch = Math.max(0, Math.floor(t / CYCLE));
    const tt = Math.max(0, t - epoch * CYCLE);
    const fade = clamp(tt / 0.4) * (1 - ease((tt - (CYCLE - FADE)) / FADE));
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const bg = rgbStr(pal.bg);

    flanks(w, dead).forEach(([x0, x1], side) => {
      const land = LANDSCAPES[side];
      const cx = (x0 + x1) / 2;
      const half = Math.max(1, Math.min((x1 - x0) * 0.5, h * 0.75));
      const cy = h / 2 + h * land.view.shift;
      const depth = h * land.view.depth;
      const height = h * land.view.height;
      const project = (x: number, y: number, v: number): Point => [
        cx + x * half * (0.84 + 0.08 * (y + 1)),
        cy + y * depth - v * height,
      ];
      const corner = (i: number, j: number) => project(gridX(i), gridY(j), land.heights[j][i]);
      const edge = strandA(pal, cx / w);

      for (let i = 0; i < COLS; i += 1) {
        const a = corner(i, 0);
        const b = corner(i + 1, 0);
        line(ctx, a[0], a[1], b[0], b[1], edge, 0.3);
      }
      for (let j = 0; j < ROWS; j += 1) {
        ctx.beginPath();
        for (let i = 0; i <= COLS; i += 1) {
          const p = corner(i, j);
          if (i) ctx.lineTo(p[0], p[1]);
          else ctx.moveTo(p[0], p[1]);
        }
        for (let i = COLS; i >= 0; i -= 1) {
          const p = corner(i, j + 1);
          ctx.lineTo(p[0], p[1]);
        }
        ctx.closePath();
        ctx.fillStyle = `rgb(${bg})`;
        ctx.strokeStyle = `rgb(${bg})`;
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        const nearness = 0.7 + (0.3 * j) / ROWS;
        land.levels.forEach((level, k) => {
          const segments = land.rings[j][k];
          if (!segments.length) return;
          const rank = (k + 1) / (LEVELS + 1);
          const towardsOptimum = land.direction > 0 ? rank : 1 - rank;
          ctx.strokeStyle = `rgba(${mixRgb(pal.a0, pal.b1, towardsOptimum)},${(0.36 + 0.55 * towardsOptimum) * nearness})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          for (let q = 0; q < segments.length; q += 4) {
            const a = project(segments[q], segments[q + 1], level);
            const b = project(segments[q + 2], segments[q + 3], level);
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
          }
          ctx.stroke();
        });

        for (const i of [0, COLS]) {
          const a = corner(i, j);
          const b = corner(i, j + 1);
          line(ctx, a[0], a[1], b[0], b[1], edge, 0.3);
        }
      }
      for (let i = 0; i < COLS; i += 1) {
        const a = corner(i, ROWS);
        const b = corner(i + 1, ROWS);
        line(ctx, a[0], a[1], b[0], b[1], edge, 0.45);
      }

      const onSurface = (p: Point, lift = 3): Point => {
        const s = project(p[0], p[1], land.z(p[0], p[1]));
        return [s[0], s[1] - lift];
      };
      const flag = onSurface([land.best[0], land.best[1]]);
      line(ctx, flag[0], flag[1], flag[0], flag[1] - 16, accent, 0.75 * fade, 1.2);
      ctx.fillStyle = `rgba(${accent},${0.9 * fade})`;
      ctx.beginPath();
      ctx.moveTo(flag[0], flag[1] - 16);
      ctx.lineTo(flag[0] + 9, flag[1] - 12.5);
      ctx.lineTo(flag[0], flag[1] - 9);
      ctx.closePath();
      ctx.fill();

      if (land.runs.length) {
        const run = land.runs[Math.floor(hash(epoch, side, 1) * land.runs.length)];
        const shared = ease(clamp((tt - START) / SHARED_TIME));
        const onward = ease(clamp((tt - START - SHARED_TIME - PAUSE) / ONWARD_TIME));
        const along = (path: Point[], q: number): Point => {
          const f = clamp(q) * (path.length - 1);
          const i = Math.min(path.length - 2, Math.floor(f));
          const a = path[i];
          const b = path[i + 1];
          return [a[0] + (b[0] - a[0]) * (f - i), a[1] + (b[1] - a[1]) * (f - i)];
        };
        const trail = (path: Point[], q: number, rgb: string, lift: number) => {
          const upTo = Math.floor(clamp(q) * (path.length - 1));
          ctx.strokeStyle = `rgba(${rgb},${0.85 * fade})`;
          ctx.lineWidth = 1.6;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          for (let i = 0; i <= upTo; i += 1) {
            const p = onSurface(path[i], lift);
            if (i) ctx.lineTo(p[0], p[1]);
            else ctx.moveTo(p[0], p[1]);
          }
          const head = onSurface(along(path, q), lift);
          ctx.lineTo(head[0], head[1]);
          ctx.stroke();
          return head;
        };
        const marker = (p: Point, rgb: string) => {
          dot(ctx, p[0], p[1], 5.6, bg, fade);
          dot(ctx, p[0], p[1], 4, rgb, 0.95 * fade);
        };

        const start = onSurface(run.shared[0]);
        ring(ctx, start[0], start[1], 5, ink, 0.5 * fade);

        const stuckAt = trail(run.shared, shared, ink, 1.5);
        let orangeAt = trail(run.shared, shared, accent, 4.5);
        if (onward > 0) orangeAt = trail(run.onward, onward, accent, 4.5);

        const trapped = shared >= 1;
        const wobble = trapped ? Math.sin(t * 5) : 0;
        const settle = ease(clamp((tt - START - SHARED_TIME) / 0.5));
        const apart = 5.5;
        marker([stuckAt[0] - apart * (1 - settle) + 2.4 * wobble, stuckAt[1] - Math.abs(2.6 * wobble)], ink);
        if (trapped) {
          ctx.setLineDash([2, 3]);
          ring(ctx, stuckAt[0], stuckAt[1], 10, ink, 0.65 * fade, 1.2);
          ctx.setLineDash([]);
        }
        marker([orangeAt[0] + apart * (1 - ease(clamp(onward * 6))), orangeAt[1]], accent);
        if (onward >= 1) {
          const pulse = ((tt - (START + SHARED_TIME + PAUSE + ONWARD_TIME)) % 1.4) / 1.4;
          ring(ctx, orangeAt[0], orangeAt[1], 6 + 15 * pulse, accent, 0.65 * (1 - pulse) * fade, 1.3);
        }
      }

      ctx.font = '500 11px ui-monospace,SFMono-Regular,Menlo,monospace';
      ctx.textAlign = side ? 'right' : 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = `rgba(${edge},0.75)`;
      ctx.fillText(CAPTIONS[side], side ? x1 : x0, h / 2 + h * 0.335);
    });
  },
};
