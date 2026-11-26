import { TAU, clamp, dot, ease, flanks, line, rgbStr, rng, strandA, strandB } from './draw';
import type { Scene } from './types';

const COUNT = 120;
const POINTS = (() => {
  const r = rng(13);
  return Array.from({ length: COUNT }, () => ({
    nx: (r() + r() + r() - 1.5) * 1.4,
    ny: (r() + r() + r() - 1.5) * 1.4,
    phase: r() * TAU,
    depth: 0.3 + 0.7 * r(),
  }));
})();

const SHAPES = 4;
function shapePoint(shape: number, i: number): [number, number] {
  const u = (i + 0.5) / COUNT;
  if (shape === 0) {
    const r = 0.12 + 0.88 * u;
    const a = u * TAU * 1.6 + (i % 2) * Math.PI;
    return [r * Math.cos(a), r * Math.sin(a)];
  }
  if (shape === 1) {
    const r = i % 3 === 0 ? 0.45 : 0.95;
    return [r * Math.cos(u * TAU * 3), r * Math.sin(u * TAU * 3)];
  }
  if (shape === 2) {
    const a = u * TAU;
    const r = 0.62 + 0.36 * Math.cos(5 * a);
    return [r * Math.cos(a), r * Math.sin(a)];
  }
  return [((i % 11) / 10 - 0.5) * 1.8, (Math.floor(i / 11) / 10 - 0.5) * 1.8];
}

const CYCLE = 5;
const STEPS = 8;

export const diffusion: Scene = {
  still: 3.6,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const epoch = Math.floor(t / CYCLE);
    const tt = t - epoch * CYCLE;
    const accent = rgbStr(pal.accent);
    const progress = clamp((tt - 0.4) / 2.6);
    const step = Math.min(STEPS, Math.floor(progress * STEPS));
    const within = progress * STEPS - step;
    const noise = tt > 4.3 ? ease((tt - 4.3) / 0.7) : Math.pow(1 - Math.min(1, (step + ease(within * 2.5)) / STEPS), 1.5);

    flanks(w, dead).forEach(([x0, x1], side) => {
      const cx = (x0 + x1) / 2;
      const R = Math.max(1, Math.min(h * 0.3, (x1 - x0) * 0.42));
      const shape = (epoch + side * 2) % SHAPES;
      POINTS.forEach((p, i) => {
        const s = shapePoint(shape, i);
        const x = cx + (s[0] * (1 - 0.25 * noise) + p.nx * 0.55 * noise + 0.03 * noise * Math.sin(t * 9 + p.phase)) * R;
        const y = cy + (s[1] * (1 - 0.25 * noise) + p.ny * 0.4 * noise + 0.03 * noise * Math.cos(t * 8 + p.phase)) * R * 0.92;
        dot(ctx, x, y, 1 + 2 * p.depth, i % 2 ? strandB(pal, x / w) : strandA(pal, x / w), (0.25 + 0.65 * p.depth) * (1 - 0.45 * noise));
      });
      for (let s = 0; s < STEPS; s += 1) {
        const done = tt <= 4.3 && s < step;
        const x = cx + (s - (STEPS - 1) / 2) * 9;
        line(ctx, x - 2.5, cy + h * 0.315, x + 2.5, cy + h * 0.315, done ? accent : strandA(pal, cx / w), done ? 0.9 : 0.3, 2);
      }
    });
  },
};
