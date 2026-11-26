import { clamp, ease, line, rgbStr, rng, roundedRect, strandA, strandB } from './draw';
import type { Scene } from './types';

const ROWS = 4;
const LENGTH = 150;

const ALIGNMENT = (() => {
  const r = rng(31);
  const base = () => 'ACGT'[Math.floor(r() * 4)];
  const consensus = Array.from({ length: LENGTH }, base);
  const rows = Array.from({ length: ROWS }, () =>
    consensus.map((c) => {
      const x = r();
      return x < 0.07 ? base() : x < 0.1 ? '-' : c;
    }),
  );
  const conservation = consensus.map((c, i) => rows.filter((row) => row[i] === c).length / ROWS);
  return { consensus, rows, conservation };
})();

const COLUMN = 13;
const CYCLE = 10;
const SLIDE_TIME = 1.6;
const SCAN_TIME = 6.6;
const OFFSETS = [3, -2, 4, -3];

export const alignment: Scene = {
  still: 6,
  draw(ctx, w, h, t, pal) {
    const cy = h / 2;
    const x0 = w * 0.05;
    const columns = Math.min(LENGTH, Math.floor((w * 0.9) / COLUMN));
    const tt = t % CYCLE;
    const accent = rgbStr(pal.accent);
    const slide = 1 - ease(tt / SLIDE_TIME);
    const scanned = clamp((tt - SLIDE_TIME) / SCAN_TIME) * columns;
    const fade = 1 - ease((tt - (CYCLE - 0.7)) / 0.7);
    const base = cy + h * 0.31;

    ctx.font = '500 12px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < columns; i += 1) {
      const x = x0 + (i + 0.5) * COLUMN;
      const u = x / w;
      const done = i < scanned;
      for (let row = 0; row < ROWS; row += 1) {
        const letter = ALIGNMENT.rows[row][i];
        const gap = letter === '-';
        const mismatch = !gap && letter !== ALIGNMENT.consensus[i];
        const lx = x + OFFSETS[row] * COLUMN * slide;
        const y = cy + (row - 1.5) * h * 0.1 - h * 0.06;
        if (done && mismatch) {
          ctx.fillStyle = `rgba(${accent},${0.22 * fade})`;
          roundedRect(ctx, lx - COLUMN / 2 + 1, y - 8, COLUMN - 2, 16, 3);
          ctx.fill();
        }
        const rgb = done && mismatch ? accent : row % 2 ? strandB(pal, u) : strandA(pal, u);
        ctx.fillStyle = `rgba(${rgb},${(gap ? 0.35 : done ? 0.9 : 0.38) * fade})`;
        ctx.fillText(gap ? '–' : letter, lx, y);
      }
      if (done) {
        const v = ALIGNMENT.conservation[i];
        line(ctx, x, base, x, base - h * 0.1 * v, v < 1 ? accent : strandA(pal, u), (v < 1 ? 0.8 : 0.5) * fade, Math.max(2, COLUMN - 6));
      }
    }
    if (scanned > 0 && scanned < columns) {
      line(ctx, x0 + scanned * COLUMN, cy - h * 0.3, x0 + scanned * COLUMN, base, rgbStr(pal.ink), 0.45, 1);
    }
    line(ctx, x0, base + 1, x0 + columns * COLUMN, base + 1, strandA(pal, 0.5), 0.35 * fade);
  },
};
