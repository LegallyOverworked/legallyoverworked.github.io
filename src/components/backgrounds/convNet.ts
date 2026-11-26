import { TAU, clamp, dot, ease, flanks, hash, line, rgbStr, roundedRect, strandA, strandB } from './draw';
import type { Scene } from './types';

const IMAGE = ['000000000', '011111110', '000000110', '000001100', '000011000', '000110000', '001100000', '001100000', '000000000'];
const SIZE = IMAGE.length;
const KERNEL = 3;
const OUT = SIZE - KERNEL + 1;
const pixel = (row: number, col: number) => (IMAGE[row][col] === '1' ? 1 : 0.05 * hash(row, col, 4));
const FEATURE = Array.from({ length: OUT * OUT }, (_, idx) => {
  const row = Math.floor(idx / OUT);
  const col = idx % OUT;
  let v = 0;
  for (let a = 0; a < KERNEL; a += 1) for (let b = 0; b < KERNEL; b += 1) v += pixel(row + a, col + b) * (a === b ? 1 : a + b === 2 ? 0.6 : 0.15);
  return clamp(v / 3);
});

const SCAN_TIME = 24;
const POOL_TIME = 16;
const FLAT = 8;
const DENSE = 5;
const CLASSES = 4;

export const convNet: Scene = {
  still: 9,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const bg = rgbStr(pal.bg);
    const [left, right] = flanks(w, dead);
    const stack = (x: number, size: number, count: number, offset: number, rgb: string): [number, number] => {
      const frontY = cy - size / 2 + ((count - 1) * offset) / 2;
      for (let i = count - 1; i >= 0; i -= 1) {
        const px = x + i * offset;
        const py = frontY - i * offset;
        ctx.fillStyle = `rgba(${bg},1)`;
        ctx.fillRect(px, py, size, size);
        ctx.fillStyle = `rgba(${rgb},0.06)`;
        ctx.fillRect(px, py, size, size);
        ctx.strokeStyle = `rgba(${rgb},${i ? 0.4 : 0.7})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(px, py, size, size);
      }
      return [x, frontY];
    };
    const cellFill = (x: number, y: number, cell: number, rgb: string, alpha: number, inset = 0.75) => {
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      ctx.fillRect(x + inset, y + inset, Math.max(0, cell - 2 * inset), Math.max(0, cell - 2 * inset));
    };
    const activity = (a: number, b: number) => 0.5 + 0.5 * Math.sin(t * 0.6 + hash(a, b, 7) * TAU);

    {
      const [x0, x1] = left;
      const span = x1 - x0;
      const imageSize = Math.max(9, Math.min(h * 0.44, span * 0.33));
      const cell = imageSize / SIZE;
      const offset = Math.max(3, imageSize * 0.05);
      const rgbA = strandA(pal, x0 / w);
      const rgbB = strandB(pal, (x0 + span * 0.6) / w);
      const position = ((t % SCAN_TIME) / SCAN_TIME) * OUT * OUT;
      const at = Math.floor(position);
      const move = ease((position - at) / 0.6);
      const next = (at + 1) % (OUT * OUT);
      const kx = (at % OUT) + ((next % OUT) - (at % OUT)) * move;
      const ky = Math.floor(at / OUT) + (Math.floor(next / OUT) - Math.floor(at / OUT)) * move;

      const image = stack(x0, imageSize, 3, offset, rgbA);
      for (let row = 0; row < SIZE; row += 1) for (let col = 0; col < SIZE; col += 1) cellFill(image[0] + col * cell, image[1] + row * cell, cell, rgbA, 0.05 + 0.62 * pixel(row, col));

      const mapSize = imageSize * 0.74;
      const mapCell = mapSize / OUT;
      const map = stack(x0 + span * 0.5, mapSize, 5, offset, rgbB);
      FEATURE.forEach((v, idx) => {
        const filled = idx < at ? 1 : idx === at ? move : 0;
        if (filled > 0) cellFill(map[0] + (idx % OUT) * mapCell, map[1] + Math.floor(idx / OUT) * mapCell, mapCell, rgbB, (0.06 + 0.72 * v) * filled);
      });

      const wx = image[0] + kx * cell;
      const wy = image[1] + ky * cell;
      const tx = map[0] + kx * mapCell;
      const ty = map[1] + ky * mapCell;
      for (const [cx, cyCorner] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
        line(ctx, wx + cx * KERNEL * cell, wy + cyCorner * KERNEL * cell, tx + cx * mapCell, ty + cyCorner * mapCell, accent, 0.3);
      }
      ctx.fillStyle = `rgba(${accent},0.14)`;
      ctx.fillRect(wx, wy, KERNEL * cell, KERNEL * cell);
      ctx.strokeStyle = `rgba(${accent},0.95)`;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(wx, wy, KERNEL * cell, KERNEL * cell);
      ctx.strokeRect(tx, ty, mapCell, mapCell);

      const pooledSize = imageSize * 0.44;
      const pooledCell = pooledSize / 4;
      const pooled = stack(x0 + span * 0.86 - pooledSize / 2, pooledSize, 7, Math.max(2.5, offset * 0.8), rgbA);
      for (let a = 0; a < 4; a += 1) {
        for (let b = 0; b < 4; b += 1) {
          const v = activity(a, b);
          if (v > 0.45) cellFill(pooled[0] + b * pooledCell, pooled[1] + a * pooledCell, pooledCell, rgbA, (v - 0.35) * 0.8, 1);
        }
      }
      const pool = (t % POOL_TIME) / POOL_TIME;
      const px = Math.floor(pool * 9) % 3;
      const py = Math.floor(pool * 3) % 3;
      const qx = map[0] + px * 2 * mapCell;
      const qy = map[1] + py * 2 * mapCell;
      const ux = pooled[0] + px * pooledCell;
      const uy = pooled[1] + py * pooledCell;
      line(ctx, qx + 2 * mapCell, qy, ux, uy, ink, 0.3);
      line(ctx, qx + 2 * mapCell, qy + 2 * mapCell, ux, uy + pooledCell, ink, 0.3);
      ctx.strokeStyle = `rgba(${ink},0.7)`;
      ctx.lineWidth = 1.2;
      ctx.strokeRect(qx, qy, 2 * mapCell, 2 * mapCell);
      ctx.strokeRect(ux, uy, pooledCell, pooledCell);
    }

    {
      const [x0, x1] = right;
      const span = x1 - x0;
      const size = Math.max(6, Math.min(h * 0.2, span * 0.13));
      const rgbA = strandA(pal, x0 / w);
      const rgbB = strandB(pal, (x0 + span * 0.5) / w);
      const last = stack(x0 + 2, size, 9, Math.max(2.5, size * 0.09), rgbA);
      for (let a = 0; a < 3; a += 1) {
        for (let b = 0; b < 3; b += 1) {
          const v = activity(a + 5, b + 3);
          if (v > 0.4) cellFill(last[0] + (b * size) / 3, last[1] + (a * size) / 3, size / 3, rgbA, (v - 0.3) * 0.8, 1);
        }
      }
      const flatX = x0 + span * 0.42;
      const denseX = x0 + span * 0.62;
      const outX = x0 + span * 0.8;
      const flatY = (i: number) => cy + (i - (FLAT - 1) / 2) * h * 0.075;
      const denseY = (i: number) => cy + (i - (DENSE - 1) / 2) * h * 0.105;
      const outY = (i: number) => cy + (i - (CLASSES - 1) / 2) * h * 0.13;
      for (let i = 0; i < FLAT; i += 1) line(ctx, last[0] + size + 6, last[1] + (size * (i + 0.5)) / FLAT, flatX - 5, flatY(i), rgbA, 0.22);
      for (let i = 0; i < FLAT; i += 1) {
        for (let j = 0; j < DENSE; j += 1) line(ctx, flatX + 4, flatY(i), denseX - 4, denseY(j), rgbB, 0.05 + 0.2 * hash(i, j, 11) ** 2);
      }
      for (let i = 0; i < DENSE; i += 1) {
        for (let j = 0; j < CLASSES; j += 1) line(ctx, denseX + 4, denseY(i), outX - 4, outY(j), rgbB, 0.06 + 0.22 * hash(i, j, 12) ** 2);
      }
      for (let n = 0; n < 4; n += 1) {
        const lap = t * 0.22 + n * 0.25;
        const leg = Math.floor(lap);
        const s = lap - leg;
        const i = Math.floor(hash(n, leg, 3) * FLAT);
        const j = Math.floor(hash(n, leg, 4) * DENSE);
        const o = Math.floor(hash(n, leg, 5) * CLASSES);
        if (s < 0.5) {
          const q = ease(s * 2);
          dot(ctx, flatX + 4 + (denseX - flatX - 8) * q, flatY(i) + (denseY(j) - flatY(i)) * q, 2, accent, 0.9);
        } else {
          const q = ease((s - 0.5) * 2);
          dot(ctx, denseX + 4 + (outX - denseX - 8) * q, denseY(j) + (outY(o) - denseY(j)) * q, 2, accent, 0.9);
        }
      }
      for (let i = 0; i < FLAT; i += 1) dot(ctx, flatX, flatY(i), 2.4 + 1.2 * activity(i, 20), rgbA, 0.5 + 0.4 * activity(i, 20));
      for (let i = 0; i < DENSE; i += 1) dot(ctx, denseX, denseY(i), 3 + 1.4 * activity(i, 30), rgbB, 0.5 + 0.4 * activity(i, 30));
      const turn = Math.floor(t / 2.5);
      const change = ease((t / 2.5 - turn) / 0.5);
      const scores = (k: number) => {
        const raw = Array.from({ length: CLASSES }, (_, i) => Math.exp(3 * hash(k, i, 9)));
        const total = raw.reduce((a, b) => a + b, 0);
        return raw.map((v) => v / total);
      };
      const before = scores(turn - 1);
      const after = scores(turn);
      const shown = before.map((v, i) => v + (after[i] - v) * change);
      const best = shown.indexOf(Math.max(...shown));
      for (let i = 0; i < CLASSES; i += 1) {
        const rgb = i === best ? accent : rgbB;
        dot(ctx, outX, outY(i), 3.4, rgb, 0.9);
        ctx.fillStyle = `rgba(${rgb},${i === best ? 0.9 : 0.5})`;
        roundedRect(ctx, outX + 9, outY(i) - 2.5, Math.max(3, (x1 - outX - 10) * shown[i] * 1.5), 5, 2.5);
        ctx.fill();
      }
    }
  },
};
