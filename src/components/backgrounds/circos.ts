import { TAU, dot, ease, flanks, hash, line, rgbStr, rng, strandA, strandB } from './draw';
import type { Scene } from './types';

const TICKS = 72;
const LINKS = 9;

const GENOMES = (() => {
  const r = rng(71);
  return [0, 1].map(() => {
    const lengths = Array.from({ length: 8 }, () => 0.6 + r());
    const total = lengths.reduce((a, b) => a + b, 0);
    let angle = 0;
    const segments = lengths.map((length): [number, number] => {
      const sweep = (length / total) * TAU;
      const segment: [number, number] = [angle + 0.035, angle + sweep - 0.035];
      angle += sweep;
      return segment;
    });
    return { segments, track: Array.from({ length: TICKS }, () => 0.2 + 0.8 * r()) };
  });
})();

const CYCLE = 5;

export const circos: Scene = {
  still: 3.8,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const epoch = Math.floor(t / CYCLE);
    const tt = t - epoch * CYCLE;
    const fade = 1 - ease((tt - 4.4) / 0.6);
    const accent = rgbStr(pal.accent);

    flanks(w, dead).forEach(([x0, x1], side) => {
      const genome = GENOMES[side];
      const cx = (x0 + x1) / 2;
      const R = Math.max(1, Math.min(h * 0.29, (x1 - x0) * 0.43));
      const turn = t * 0.08 * (side ? -1 : 1);
      const a = strandA(pal, cx / w);
      const b = strandB(pal, cx / w);
      const at = (angle: number, radius: number): [number, number] => [cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius];

      genome.segments.forEach((segment, i) => {
        ctx.strokeStyle = `rgba(${i % 2 ? b : a},0.75)`;
        ctx.lineWidth = Math.max(3, R * 0.07);
        ctx.beginPath();
        ctx.arc(cx, cy, R, segment[0] + turn, segment[1] + turn);
        ctx.stroke();
      });
      for (let i = 0; i < TICKS; i += 1) {
        const angle = (i / TICKS) * TAU + turn;
        const p1 = at(angle, R * 1.06);
        const p2 = at(angle, R * (i % 6 ? 1.09 : 1.13));
        line(ctx, p1[0], p1[1], p2[0], p2[1], a, 0.4);
      }
      for (let i = 0; i < TICKS; i += 1) {
        const angle = ((i + 0.5) / TICKS) * TAU + turn;
        const v = genome.track[i] * (0.7 + 0.3 * Math.sin(t * 1.2 + i * 0.7));
        const p1 = at(angle, R * 0.9);
        const p2 = at(angle, R * (0.9 - 0.16 * v));
        line(ctx, p1[0], p1[1], p2[0], p2[1], b, 0.4, 1.5);
      }
      for (let j = 0; j < LINKS; j += 1) {
        const drawn = ease((tt - (0.2 + j * 0.38)) / 0.6);
        if (drawn <= 0) continue;
        const a1 = hash(epoch, side * 20 + j, 1) * TAU + turn;
        const a2 = a1 + TAU * (0.2 + 0.6 * hash(epoch, side * 20 + j, 2));
        const rgb = j % 3 === 2 ? accent : j % 3 ? b : a;
        const p1 = at(a1, R * 0.72);
        const p2 = at(a2, R * 0.72);
        ctx.strokeStyle = `rgba(${rgb},${0.6 * fade})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        for (let i = 0; i <= 24 * drawn; i += 1) {
          const s = i / 24;
          ctx.lineTo((1 - s) * (1 - s) * p1[0] + 2 * s * (1 - s) * cx + s * s * p2[0], (1 - s) * (1 - s) * p1[1] + 2 * s * (1 - s) * cy + s * s * p2[1]);
        }
        ctx.stroke();
        dot(ctx, p1[0], p1[1], 2, rgb, 0.85 * fade);
        if (drawn >= 1) dot(ctx, p2[0], p2[1], 2, rgb, 0.85 * fade);
      }
    });
  },
};
