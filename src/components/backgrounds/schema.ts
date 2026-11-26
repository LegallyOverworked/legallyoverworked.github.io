import { dot, ease, flanks, hash, line, rgbStr, ring, roundedRect, strandA, strandB } from './draw';
import type { Scene } from './types';

type Point = [number, number];

const CYCLE = 5;
const LIT: [number, number, number][] = [
  [0, 2, 0.3],
  [1, 0, 1.3],
  [1, 1, 1.5],
  [2, 2, 2.6],
  [2, 0, 2.9],
  [0, 0, 3.8],
];
const HOPS: [number, number, number, number, number, number][] = [
  [0, 2, 1, 0, 0.3, 1.3],
  [1, 1, 2, 2, 1.6, 2.6],
  [2, 0, 0, 0, 3, 3.8],
];

export const schema: Scene = {
  still: 3.2,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const tt = t % CYCLE;
    const fade = 1 - ease((tt - 4.5) / 0.5);
    const accent = rgbStr(pal.accent);
    const bg = rgbStr(pal.bg);

    flanks(w, dead).forEach(([x0, x1], side) => {
      const span = x1 - x0;
      const tableW = Math.min(span * 0.28, 104);
      const rowH = Math.max(9, h * 0.047);
      const rgb = side ? strandB(pal, x0 / w) : strandA(pal, x0 / w);
      const tables = [
        { x: x0, y: cy - h * 0.29, rows: 4 },
        { x: x0 + span * 0.5 - tableW / 2, y: cy + h * 0.06, rows: 3 },
        { x: x0 + span - tableW, y: cy - h * 0.29, rows: 4 },
      ];
      const rowY = (table: number, row: number) => tables[table].y + rowH * (row + 1.5);
      const lit = (table: number, row: number) => {
        let v = 0;
        for (const [tb, r, at] of LIT) if (tb === table && r === row) v = Math.max(v, ease((tt - at) / 0.25));
        return v * fade;
      };

      for (const [fromTable, fromRow, toTable, toRow, start, arrive] of HOPS) {
        const a: Point = [tables[fromTable].x + (fromTable === 2 ? 0 : tableW), rowY(fromTable, fromRow)];
        const b: Point = [tables[toTable].x + (toTable === 0 ? tableW : 0), rowY(toTable, toRow)];
        const midX = (a[0] + b[0]) / 2;
        const path: Point[] = [a, [midX, a[1]], [midX, b[1]], b];
        ctx.strokeStyle = `rgba(${rgb},0.45)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        for (let i = 1; i < path.length; i += 1) ctx.lineTo(path[i][0], path[i][1]);
        ctx.stroke();
        const dir = b[0] > a[0] ? 1 : -1;
        line(ctx, b[0] - dir * 6, b[1], b[0], b[1] - 4, rgb, 0.6);
        line(ctx, b[0] - dir * 6, b[1], b[0], b[1] + 4, rgb, 0.6);
        const q = (tt - start) / (arrive - start);
        if (q > 0 && q < 1) {
          const lengths = [Math.abs(midX - a[0]), Math.abs(b[1] - a[1]), Math.abs(b[0] - midX)];
          let d = ease(q) * (lengths[0] + lengths[1] + lengths[2]);
          let leg = 0;
          while (leg < 2 && d > lengths[leg]) {
            d -= lengths[leg];
            leg += 1;
          }
          const s = lengths[leg] ? d / lengths[leg] : 0;
          const px = path[leg][0] + (path[leg + 1][0] - path[leg][0]) * s;
          const py = path[leg][1] + (path[leg + 1][1] - path[leg][1]) * s;
          dot(ctx, px, py, 3, accent, 0.95);
          ring(ctx, px, py, 6, accent, 0.4);
        }
      }

      tables.forEach((table, ti) => {
        const height = rowH * (table.rows + 1);
        ctx.fillStyle = `rgba(${bg},0.9)`;
        roundedRect(ctx, table.x, table.y, tableW, height, 4);
        ctx.fill();
        ctx.fillStyle = `rgba(${rgb},0.06)`;
        ctx.strokeStyle = `rgba(${rgb},0.6)`;
        ctx.lineWidth = 1;
        roundedRect(ctx, table.x, table.y, tableW, height, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = `rgba(${rgb},0.22)`;
        roundedRect(ctx, table.x, table.y, tableW, rowH, 4);
        ctx.fill();
        ctx.fillStyle = `rgba(${rgb},0.85)`;
        roundedRect(ctx, table.x + 7, table.y + rowH / 2 - 2.5, tableW * 0.45, 5, 2.5);
        ctx.fill();
        for (let row = 0; row < table.rows; row += 1) {
          const y = rowY(ti, row);
          const v = lit(ti, row);
          if (v > 0) {
            ctx.fillStyle = `rgba(${accent},${0.28 * v})`;
            ctx.fillRect(table.x + 1, y - rowH / 2, tableW - 2, rowH);
          }
          line(ctx, table.x, y - rowH / 2, table.x + tableW, y - rowH / 2, rgb, 0.25);
          dot(ctx, table.x + 8, y, 1.6, v > 0 ? accent : rgb, 0.8);
          ctx.fillStyle = `rgba(${v > 0.5 ? accent : rgb},${0.5 + 0.4 * v})`;
          roundedRect(ctx, table.x + 14, y - 2, tableW * (0.25 + 0.4 * hash(ti, row, side + 5)), 4, 2);
          ctx.fill();
        }
      });
    });
  },
};
