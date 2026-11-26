import { TAU, clamp, dot, ease, hash, rgbStr, ring, rng, strandA } from './draw';
import type { Scene } from './types';

const POINTS = (() => {
  const r = rng(33);
  const pts = Array.from({ length: 112 }, (_, i) => ({
    cls: i % 2,
    cluster: Math.floor(r() * 4),
    gx: (r() + r() + r() - 1.5) / 1.5,
    gy: (r() + r() + r() - 1.5) / 1.5,
    depth: 0.25 + 0.75 * r(),
    phase: r() * TAU,
  }));
  return pts.sort((a, b) => a.depth - b.depth);
})();
type DataPoint = (typeof POINTS)[number];

const CYCLE = 5;
const STEPS = 90;

export const classifier: Scene = {
  still: 3.5,
  draw(ctx, w, h, t, pal) {
    const cy = h / 2;
    const x0 = w * 0.05;
    const x1 = w * 0.95;
    const epoch = Math.floor(t / CYCLE);
    const tt = t - epoch * CYCLE;
    const amp = Math.min(h * 0.1, w * 0.06);
    const X = (u: number) => x0 + (x1 - x0) * u;
    const boundary = (k: number, u: number) =>
      amp *
      (0.7 * Math.sin(TAU * (0.6 + 0.5 * hash(k, 5, 0)) * u + TAU * hash(k, 6, 0)) +
        0.3 * Math.sin(TAU * (1.5 + hash(k, 7, 0)) * u + TAU * hash(k, 8, 0)));
    const place = (k: number, p: DataPoint): [number, number] => {
      const id = p.cls * 7 + p.cluster;
      const u = clamp(0.1 + (0.8 * (p.cluster + 0.5)) / 4 + 0.06 * (hash(k, id, 11) - 0.5) + p.gx * 0.1, 0.01, 0.99);
      const side = p.cls ? 1 : -1;
      return [u, boundary(k, u) + side * h * (0.115 + 0.045 * hash(k, id, 12)) + p.gy * h * 0.075];
    };
    const dataMix = ease(tt / 0.9);
    const modelMix = ease((tt - 0.6) / 2.4);
    const lag = dataMix - modelMix;
    const model = (u: number) => cy + boundary(epoch - 1, u) * (1 - modelMix) + boundary(epoch, u) * modelMix;
    const margin = h * (0.018 + 0.03 * (1 - lag));
    const gradient = (alpha: number) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, `rgba(${strandA(pal, 0)},${alpha})`);
      g.addColorStop(1, `rgba(${strandA(pal, 1)},${alpha})`);
      return g;
    };

    ctx.fillStyle = gradient(0.07);
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i += 1) ctx.lineTo(X(i / STEPS), model(i / STEPS) - margin);
    for (let i = STEPS; i >= 0; i -= 1) ctx.lineTo(X(i / STEPS), model(i / STEPS) + margin);
    ctx.closePath();
    ctx.fill();
    ctx.setLineDash([2, 4]);
    for (const side of [-1, 1]) {
      ctx.strokeStyle = `rgba(${strandA(pal, 0.5)},0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= STEPS; i += 1) ctx.lineTo(X(i / STEPS), model(i / STEPS) + side * margin);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.strokeStyle = gradient(0.85);
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i += 1) ctx.lineTo(X(i / STEPS), model(i / STEPS));
    ctx.stroke();

    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    for (const p of POINTS) {
      const from = place(epoch - 1, p);
      const to = place(epoch, p);
      const u = from[0] + (to[0] - from[0]) * dataMix;
      const x = X(u);
      const y = cy + from[1] + (to[1] - from[1]) * dataMix + Math.sin(t * 0.9 + p.phase) * 1.5;
      const r = 1.2 + 2.2 * p.depth;
      const alpha = 0.3 + 0.65 * p.depth;
      if (p.cls) ring(ctx, x, y, r + 0.4, accent, alpha, 1.3);
      else dot(ctx, x, y, r, strandA(pal, u), alpha);
      const misclassified = p.cls ? y < model(u) : y > model(u);
      if (misclassified) ring(ctx, x, y, r + 4, ink, 0.55);
    }
  },
};
