import { dot, hash, line, rgbStr, ring, strandA, strandB } from './draw';
import type { Scene } from './types';

const SPEED = 26;
const LANES = [1, -1, 2, -2, 1, -2];

export const gitGraph: Scene = {
  still: 2,
  draw(ctx, w, h, t, pal) {
    const cy = h / 2;
    const x0 = w * 0.05;
    const x1 = w * 0.95;
    const segment = Math.max(150, w * 0.17);
    const offset = t * SPEED + segment * 3;
    const lane = h * 0.115;
    const spacing = segment / 4;
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const bg = rgbStr(pal.bg);

    ctx.save();
    ctx.beginPath();
    ctx.rect(x0, 0, x1 - x0, h);
    ctx.clip();
    line(ctx, x0, cy, x1, cy, strandA(pal, 0.5), 0.55, 1.4);

    const first = Math.floor(offset / segment) - 3;
    const last = Math.floor((offset + x1 - x0) / segment) + 1;
    const commits: { x: number; merge: boolean }[] = [];
    for (let n = first; n <= last; n += 1) {
      const startX = x0 + n * segment - offset;
      const side = LANES[((n % LANES.length) + LANES.length) % LANES.length];
      const length = segment * (0.9 + 0.9 * hash(n, 1, 1));
      const fork = startX + spacing * 0.5;
      const merge = fork + length;
      const y = cy - side * lane;
      const rgb = Math.abs(side) === 2 ? strandB(pal, 0.7) : strandA(pal, 0.25);
      const bend = spacing * 0.8;
      ctx.strokeStyle = `rgba(${rgb},0.65)`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(fork, cy);
      ctx.bezierCurveTo(fork + bend * 0.5, cy, fork + bend * 0.5, y, fork + bend, y);
      ctx.lineTo(merge - bend, y);
      ctx.bezierCurveTo(merge - bend * 0.5, y, merge - bend * 0.5, cy, merge, cy);
      ctx.stroke();
      const onBranch = Math.max(2, Math.round((length - 2 * bend) / spacing));
      for (let j = 0; j < onBranch; j += 1) dot(ctx, fork + bend + ((j + 0.5) * (length - 2 * bend)) / onBranch, y, 2.6, rgb, 0.9);
      for (let j = 0; j < 4; j += 1) commits.push({ x: startX + j * spacing, merge: false });
      commits.push({ x: merge, merge: true });
    }

    for (const c of commits) {
      if (!c.merge) {
        dot(ctx, c.x, cy, 4.4, bg, 1);
        dot(ctx, c.x, cy, 3, strandA(pal, c.x / w), 0.9);
        continue;
      }
      const pending = c.x > x1 - segment * 0.7;
      dot(ctx, c.x, cy, 6.5, bg, 1);
      ring(ctx, c.x, cy, 5.2, pending ? accent : ink, 0.9, 1.4);
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      if (pending) {
        ctx.strokeStyle = `rgba(${accent},0.9)`;
        ctx.arc(c.x, cy, 9, t * 5, t * 5 + 2.2);
      } else {
        ctx.strokeStyle = `rgba(${ink},0.9)`;
        ctx.lineJoin = 'round';
        ctx.moveTo(c.x - 2.6, cy);
        ctx.lineTo(c.x - 0.6, cy + 2.2);
        ctx.lineTo(c.x + 2.8, cy - 2.2);
      }
      ctx.stroke();
    }
    ctx.restore();

    dot(ctx, x1, cy, 4, ink, 0.95);
    ring(ctx, x1, cy, 7 + 2 * Math.sin(t * 3), ink, 0.5, 1.2);
  },
};
