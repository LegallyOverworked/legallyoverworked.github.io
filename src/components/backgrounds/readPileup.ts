import { dot, ease, flanks, line, rgbStr, ring, rng, strandA, strandB } from './draw';
import type { Scene } from './types';

interface Read {
  start: number;
  end: number;
  forward: boolean;
  alt: boolean;
  row: number;
  order: number;
}

const PILEUPS = (() => {
  const r = rng(61);
  return [0, 1].map(() => {
    const raw = Array.from({ length: 30 }, () => {
      const length = 0.1 + 0.08 * r();
      const start = r() * (1 - length);
      return { start, end: start + length, forward: r() < 0.5, alt: r() < 0.5, key: r() };
    }).sort((a, b) => a.start - b.start);
    const rowEnds: number[] = [];
    const rows = raw.map((read) => {
      let row = 0;
      while (rowEnds[row] !== undefined && rowEnds[row] > read.start - 0.015) row += 1;
      rowEnds[row] = read.end;
      return row;
    });
    const arrival = raw.map((read, i) => ({ i, key: read.key })).sort((a, b) => a.key - b.key);
    const order = new Array<number>(raw.length);
    arrival.forEach((a, k) => {
      order[a.i] = k;
    });
    const reads: Read[] = raw.map((read, i) => ({ start: read.start, end: read.end, forward: read.forward, alt: read.alt, row: rows[i], order: order[i] }));
    return { reads, rows: rowEnds.length, site: 0.3 + 0.4 * r() };
  });
})();

const CYCLE = 5;
const BINS = 40;

export const readPileup: Scene = {
  still: 4,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const tt = t % CYCLE;
    const fade = 1 - ease((tt - 4.5) / 0.5);
    const accent = rgbStr(pal.accent);
    const reverse = rgbStr(pal.chainB[0]);

    flanks(w, dead).forEach(([x0, x1], side) => {
      const pile = PILEUPS[side];
      const span = x1 - x0;
      const X = (u: number) => x0 + u * span;
      const refY = cy - h * 0.28;
      const rowH = Math.min(h * 0.06, (h * 0.42) / pile.rows);
      const half = Math.max(1.5, rowH * 0.21);
      const covY = cy + h * 0.31;
      const siteX = X(pile.site);
      const reference = strandB(pal, x0 / w);

      line(ctx, x0, refY, X(1), refY, reference, 0.75 * fade, 2);
      for (let i = 0; i <= 20; i += 1) line(ctx, X(i / 20), refY + 2, X(i / 20), refY + (i % 5 ? 5 : 8), reference, 0.5 * fade);

      const coverage = new Array<number>(BINS).fill(0);
      let altReads = 0;
      for (const read of pile.reads) {
        const arrived = ease((tt - (0.2 + (3.1 * read.order) / pile.reads.length)) / 0.35);
        if (arrived <= 0) continue;
        const y = refY + h * 0.085 + read.row * rowH - (1 - arrived) * 10;
        const a = X(read.start) + 1;
        const b = X(read.end) - 1;
        const tip = Math.min(half * 1.6, (b - a) / 2);
        ctx.fillStyle = `rgba(${read.forward ? strandA(pal, a / w) : reverse},${0.5 * arrived * fade})`;
        ctx.beginPath();
        if (read.forward) {
          ctx.moveTo(a, y - half);
          ctx.lineTo(b - tip, y - half);
          ctx.lineTo(b, y);
          ctx.lineTo(b - tip, y + half);
          ctx.lineTo(a, y + half);
        } else {
          ctx.moveTo(b, y - half);
          ctx.lineTo(a + tip, y - half);
          ctx.lineTo(a, y);
          ctx.lineTo(a + tip, y + half);
          ctx.lineTo(b, y + half);
        }
        ctx.closePath();
        ctx.fill();
        if (read.start < pile.site && read.end > pile.site && read.alt) {
          altReads += 1;
          dot(ctx, siteX, y, Math.max(2.2, rowH * 0.3), accent, arrived * fade);
        }
        if (arrived > 0.5) {
          for (let bin = 0; bin < BINS; bin += 1) {
            const u = (bin + 0.5) / BINS;
            if (u > read.start && u < read.end) coverage[bin] += 1;
          }
        }
      }

      const cover = strandA(pal, x0 / w);
      ctx.fillStyle = `rgba(${cover},${0.16 * fade})`;
      ctx.strokeStyle = `rgba(${cover},${0.6 * fade})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0, covY);
      for (let bin = 0; bin < BINS; bin += 1) ctx.lineTo(X((bin + 0.5) / BINS), covY - coverage[bin] * h * 0.013);
      ctx.lineTo(X(1), covY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      if (altReads >= 3) {
        ctx.setLineDash([2, 3]);
        line(ctx, siteX, refY + 8, siteX, covY, accent, 0.5 * fade);
        ctx.setLineDash([]);
        dot(ctx, siteX, refY, 3.4, accent, fade);
        const pulse = (tt % 1.4) / 1.4;
        ring(ctx, siteX, refY, 5 + 9 * pulse, accent, 0.55 * (1 - pulse) * fade, 1.2);
      }
    });
  },
};
