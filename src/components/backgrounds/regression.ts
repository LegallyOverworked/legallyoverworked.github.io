import { TAU, dot, ease, hash, line, rng, strandA, strandB } from './draw';
import type { Scene } from './types';

const POINTS = (() => {
  const r = rng(21);
  const n = 84;
  const pts = Array.from({ length: n }, (_, i) => ({
    u: (i + 0.15 + 0.7 * r()) / n,
    residual: (r() + r() + r() - 1.5) / 1.5,
    depth: r(),
    phase: r() * TAU,
  }));
  return pts.sort((a, b) => a.depth - b.depth);
})();

const CYCLE = 5;
const STEPS = 90;

export const regression: Scene = {
  still: 3.5,
  draw(ctx, w, h, t, pal) {
    const cy = h / 2;
    const amp = Math.min(h * 0.2, w * 0.1);
    const x0 = w * 0.05;
    const x1 = w * 0.95;
    const epoch = Math.floor(t / CYCLE);
    const tt = t - epoch * CYCLE;
    const X = (u: number) => x0 + (x1 - x0) * u;
    const shape = (k: number, u: number) =>
      amp *
      (0.62 * Math.sin(TAU * (0.9 + 0.5 * hash(k, 1, 0)) * u + TAU * hash(k, 2, 0)) +
        0.38 * Math.sin(TAU * (1.8 + hash(k, 3, 0)) * u + TAU * hash(k, 4, 0)));
    const dataMix = ease(tt / 0.8);
    const modelMix = ease((tt - 0.5) / 2.3);
    const lag = dataMix - modelMix;
    const data = (u: number) => shape(epoch - 1, u) * (1 - dataMix) + shape(epoch, u) * dataMix;
    const model = (u: number) => cy + shape(epoch - 1, u) * (1 - modelMix) + shape(epoch, u) * modelMix;
    const band = amp * (0.15 + 0.4 * lag);
    const gradient = (alpha: number) => {
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, `rgba(${strandA(pal, 0)},${alpha})`);
      g.addColorStop(1, `rgba(${strandA(pal, 1)},${alpha})`);
      return g;
    };

    ctx.fillStyle = gradient(0.08);
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i += 1) ctx.lineTo(X(i / STEPS), model(i / STEPS) - band);
    for (let i = STEPS; i >= 0; i -= 1) ctx.lineTo(X(i / STEPS), model(i / STEPS) + band);
    ctx.closePath();
    ctx.fill();

    const pts = POINTS.map((p) => ({
      x: X(p.u),
      y: cy + data(p.u) + p.residual * amp * 0.6 + Math.sin(t * 0.9 + p.phase) * 1.5,
      fit: model(p.u),
      depth: p.depth,
      color: p.phase > Math.PI ? strandB(pal, p.u) : strandA(pal, p.u),
    }));
    for (const p of pts) line(ctx, p.x, p.y, p.x, p.fit, p.color, 0.08 + 0.16 * p.depth);

    ctx.strokeStyle = gradient(0.85);
    ctx.lineWidth = 1.6;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i += 1) ctx.lineTo(X(i / STEPS), model(i / STEPS));
    ctx.stroke();

    for (const p of pts) dot(ctx, p.x, p.y, 1 + 2.4 * p.depth, p.color, 0.25 + 0.7 * p.depth);
  },
};
