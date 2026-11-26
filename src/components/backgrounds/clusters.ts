import { TAU, dot, ease, hash, line, rgbStr, ring, rng, strandA, strandB } from './draw';
import type { Palette, Scene } from './types';

const CLUSTERS = 6;
const POINTS = (() => {
  const r = rng(51);
  return Array.from({ length: 126 }, (_, i) => ({
    cluster: i % CLUSTERS,
    ox: (r() + r() + r() - 1.5) / 1.5,
    oy: (r() + r() + r() - 1.5) / 1.5,
    nx: r(),
    ny: r(),
    depth: 0.25 + 0.75 * r(),
    phase: r() * TAU,
    delay: r() * 0.7,
  }));
})();
type DataPoint = (typeof POINTS)[number];

const CLUSTER_U = [0.1, 0.235, 0.37, 0.63, 0.765, 0.9];
const CYCLE = 5;

export const clusters: Scene = {
  still: 4.6,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const epoch = Math.floor(t / CYCLE);
    const tt = t - epoch * CYCLE;
    const colour = (pal_: Palette, cluster: number, u: number) =>
      cluster % 3 === 0 ? strandA(pal_, u) : cluster % 3 === 1 ? strandB(pal_, u) : rgbStr(pal_.accent);
    const centre = (k: number, c: number): [number, number] => [
      w * (CLUSTER_U[c] + 0.02 * (hash(k, c, 21) - 0.5)),
      cy + h * (c % 2 ? 0.11 : -0.11) * (0.6 + 0.8 * hash(k, c, 22)),
    ];
    const spread = (k: number, c: number) => Math.min(w * 0.05, h * 0.1) * (0.75 + 0.5 * hash(k, c, 23));
    const inCluster = (k: number, p: DataPoint): [number, number] => {
      const c = centre(k, p.cluster);
      const s = spread(k, p.cluster);
      const angle = TAU * hash(k, p.cluster, 24);
      return [
        c[0] + (p.ox * Math.cos(angle) - p.oy * Math.sin(angle)) * s,
        c[1] + (p.ox * Math.sin(angle) + p.oy * Math.cos(angle)) * s * 0.8,
      ];
    };

    const scatter = ease((tt - 1.1) / 0.8);
    const outline = 1 - ease((tt - 1.0) / 0.4) + ease((tt - 3.9) / 0.6);
    const shown = scatter > 0.5 ? epoch : epoch - 1;
    if (outline > 0) {
      for (let c = 0; c < CLUSTERS; c += 1) {
        const at = centre(shown, c);
        const rgb = colour(pal, c, at[0] / w);
        ctx.setLineDash([3, 4]);
        ring(ctx, at[0], at[1], spread(shown, c) * 1.25, rgb, 0.35 * outline);
        ctx.setLineDash([]);
        line(ctx, at[0] - 4, at[1], at[0] + 4, at[1], rgb, 0.6 * outline);
        line(ctx, at[0], at[1] - 4, at[0], at[1] + 4, rgb, 0.6 * outline);
      }
    }

    const flank = w / 2 - dead - w * 0.08;
    for (const p of POINTS) {
      const from = inCluster(epoch - 1, p);
      const to = inCluster(epoch, p);
      const noiseX = (p.cluster < CLUSTERS / 2 ? w * 0.05 : w / 2 + dead + w * 0.03) + p.nx * flank;
      const noiseY = cy + (p.ny - 0.5) * h * 0.5;
      const gather = ease((tt - 1.9 - p.delay) / 1.5);
      let x = from[0] + (noiseX - from[0]) * scatter;
      let y = from[1] + (noiseY - from[1]) * scatter;
      x += (to[0] - x) * gather;
      y += (to[1] - y) * gather + Math.sin(t * 0.9 + p.phase) * 1.5;
      const tint = 1 - scatter + gather;
      const r = 1.2 + 2 * p.depth;
      if (tint < 1) dot(ctx, x, y, r, strandA(pal, x / w), (0.2 + 0.4 * p.depth) * (1 - tint));
      if (tint > 0) dot(ctx, x, y, r, colour(pal, p.cluster, x / w), (0.3 + 0.65 * p.depth) * tint);
    }
  },
};
