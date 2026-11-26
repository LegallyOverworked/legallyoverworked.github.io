import { clamp, dot, ease, line, rgbStr, rng, strandA, strandB } from './draw';
import type { Scene } from './types';

interface Sample {
  value: number;
  jitter: number;
}

const BINS = 11;
const BANDWIDTH = 0.09;

const SAMPLES: Sample[][] = (() => {
  const r = rng(77);
  const draw = (value: (normal: number, uniform: number) => number): Sample[] =>
    Array.from({ length: 64 }, () => {
      const normal = (r() + r() + r() + r() - 2) / 2;
      return { value: clamp(value(normal, r())), jitter: r() };
    });
  return [draw((g) => 0.5 + g * 0.42), draw((g, u) => (u < 0.55 ? 0.3 : 0.74) + g * 0.24)];
})();
const binOf = (s: Sample) => Math.min(BINS - 1, Math.floor(s.value * BINS));
const TALLEST = SAMPLES.map((set) => {
  const counts = new Array<number>(BINS).fill(0);
  for (const s of set) counts[binOf(s)] += 1;
  return Math.max(...counts);
});

const CYCLE = 5;
const PRE_ROLL = 1.7;
const FALL_TIME = 0.55;

export const histogram: Scene = {
  still: 2.6,
  draw(ctx, w, h, t, pal, dead) {
    const tt = (t + PRE_ROLL) % CYCLE;
    const base = h / 2 + h * 0.3;
    const top = h / 2 - h * 0.33;
    const fade = 1 - ease((tt - 4.4) / 0.5);
    const accent = rgbStr(pal.accent);

    const chart = (x0: number, x1: number, set: number, u: number) => {
      const samples = SAMPLES[set];
      const binWidth = (x1 - x0) / BINS;
      const unit = (h * 0.5) / TALLEST[set];
      const bars = strandA(pal, u);
      line(ctx, x0 - 4, base, x1 + 4, base, bars, 0.45 * fade);

      const counts = new Array<number>(BINS).fill(0);
      const falling: { x: number; progress: number; bin: number }[] = [];
      samples.forEach((s, i) => {
        const lands = 0.3 + (3.3 * i) / samples.length;
        if (tt >= lands) counts[binOf(s)] += 1;
        else if (tt > lands - FALL_TIME) {
          falling.push({ x: x0 + (binOf(s) + 0.25 + 0.5 * s.jitter) * binWidth, progress: (tt - (lands - FALL_TIME)) / FALL_TIME, bin: binOf(s) });
        }
      });
      for (let b = 0; b < BINS; b += 1) {
        if (!counts[b]) continue;
        const height = counts[b] * unit;
        ctx.fillStyle = `rgba(${bars},${0.16 * fade})`;
        ctx.strokeStyle = `rgba(${bars},${0.6 * fade})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(x0 + b * binWidth + 1.5, base - height, Math.max(1, binWidth - 3), height);
        ctx.fill();
        ctx.stroke();
      }
      for (const f of falling) {
        const landing = base - counts[f.bin] * unit;
        const y = top + (landing - top) * f.progress * f.progress;
        line(ctx, f.x, y - 8 * f.progress, f.x, y, accent, 0.35 * fade, 1.2);
        dot(ctx, f.x, y, 2.2, accent, 0.9 * fade);
      }
      const fitted = ease((tt - 2.2) / 1.4);
      if (fitted > 0) {
        const density = (x: number) => {
          let sum = 0;
          for (const s of samples) sum += Math.exp(-(((x - s.value) / BANDWIDTH) ** 2) / 2);
          return sum / samples.length / BANDWIDTH / Math.sqrt(2 * Math.PI);
        };
        ctx.strokeStyle = `rgba(${strandB(pal, u)},${0.9 * fade})`;
        ctx.lineWidth = 1.6;
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const steps = 60;
        for (let i = 0; i <= steps * fitted; i += 1) {
          const x = i / steps;
          ctx.lineTo(x0 + x * (x1 - x0), base - ((density(x) * samples.length) / BINS) * unit);
        }
        ctx.stroke();
      }
    };

    chart(w * 0.05, w / 2 - dead - w * 0.03, 0, 0.2);
    chart(w / 2 + dead + w * 0.03, w * 0.95, 1, 0.8);
  },
};
