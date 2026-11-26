import { clamp, dot, flanks, hash, line, rgbStr, ring, roundedRect, strandA, strandB } from './draw';
import type { Scene } from './types';

const STREAMS = 5;
const PERIOD = 7;
const BLOCKS_PER_SIDE = 2;

export const transformer: Scene = {
  still: 2,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const accent = rgbStr(pal.accent);
    const bg = rgbStr(pal.bg);
    const gapY = h * 0.115;
    const streamY = (i: number) => cy + (i - (STREAMS - 1) / 2) * gapY;
    const xa = w * 0.05 + 30;
    const xb = w * 0.95 - 52;
    const glowX = (i: number) => xa + (xb - xa) * ((t / PERIOD + i * 0.06) % 1);

    for (let i = 0; i < STREAMS; i += 1) {
      const rail = ctx.createLinearGradient(xa, 0, xb, 0);
      rail.addColorStop(0, `rgba(${strandA(pal, 0)},0.3)`);
      rail.addColorStop(1, `rgba(${strandA(pal, 1)},0.3)`);
      ctx.strokeStyle = rail;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xa, streamY(i));
      ctx.lineTo(xb, streamY(i));
      ctx.stroke();
    }

    const blocks: { attention: number; mlp: number; width: number; id: number }[] = [];
    flanks(w, dead).forEach(([x0, x1], side) => {
      const a = side ? x0 + 6 : xa + 10;
      const b = side ? xb - 10 : x1 - 6;
      const span = b - a;
      for (let k = 0; k < BLOCKS_PER_SIDE; k += 1) {
        blocks.push({ attention: a + span * (0.16 + 0.5 * k), mlp: a + span * (0.37 + 0.5 * k), width: span * 0.1, id: side * 2 + k });
      }
    });

    for (const block of blocks) {
      const near = 0.4 + 0.6 * (1 - clamp(Math.abs(glowX(2) - block.attention) / (w * 0.14)));
      for (let i = 0; i < STREAMS; i += 1) {
        for (let j = 0; j < STREAMS; j += 1) {
          if (i === j) continue;
          const weight = Math.pow(0.5 + 0.5 * Math.sin(t * 0.45 + i * 1.9 + j * 2.7 + block.id * 1.3), 3);
          const alpha = (0.05 + 0.42 * weight) * near;
          if (alpha < 0.05) continue;
          ctx.strokeStyle = `rgba(${weight > 0.82 ? accent : strandB(pal, block.attention / w)},${alpha})`;
          ctx.lineWidth = 0.8 + 1.3 * weight;
          ctx.beginPath();
          ctx.moveTo(block.attention - block.width, streamY(i));
          ctx.bezierCurveTo(block.attention, streamY(i), block.attention, streamY(j), block.attention + block.width, streamY(j));
          ctx.stroke();
        }
      }
      for (let i = 0; i < STREAMS; i += 1) {
        const lit = 1 - clamp(Math.abs(glowX(i) - block.mlp) / (w * 0.06));
        const rgb = strandA(pal, block.mlp / w);
        const y = streamY(i);
        ctx.fillStyle = `rgba(${bg},1)`;
        roundedRect(ctx, block.mlp - 6, y - 6, 12, 12, 3.5);
        ctx.fill();
        ctx.fillStyle = `rgba(${rgb},${0.1 + 0.32 * lit})`;
        ctx.strokeStyle = `rgba(${rgb},${0.45 + 0.4 * lit})`;
        ctx.lineWidth = 1;
        roundedRect(ctx, block.mlp - 6, y - 6, 12, 12, 3.5);
        ctx.fill();
        ctx.stroke();
        dot(ctx, block.mlp + block.width * 0.95, y, 3.4, bg, 1);
        ring(ctx, block.mlp + block.width * 0.95, y, 2.8, rgb, 0.4 + 0.35 * lit);
      }
    }

    for (let i = 0; i < STREAMS; i += 1) {
      const x = glowX(i);
      const y = streamY(i);
      const rgb = strandA(pal, x / w);
      const edge = Math.max(0, Math.min(1, (x - xa) / 40, (xb - x) / 40));
      line(ctx, Math.max(xa, x - 34), y, x, y, rgb, 0.4 * edge, 1.6);
      dot(ctx, x, y, 9, rgb, 0.06 * edge);
      dot(ctx, x, y, 5.5, rgb, 0.12 * edge);
      dot(ctx, x, y, 2.4, rgb, 0.75 * edge);
    }

    for (let i = 0; i < STREAMS; i += 1) {
      const y = streamY(i);
      const input = strandA(pal, 0.05);
      const width = 20 + 8 * hash(i, 1, 2);
      ctx.fillStyle = `rgba(${input},0.12)`;
      ctx.strokeStyle = `rgba(${input},0.6)`;
      ctx.lineWidth = 1;
      roundedRect(ctx, xa - width - 4, y - 6, width, 12, 5);
      ctx.fill();
      ctx.stroke();
      const predicted = i === STREAMS - 1;
      const output = predicted ? accent : strandA(pal, 0.95);
      const pulse = predicted ? 0.6 + 0.4 * Math.sin(t * 1.2) : 0.6;
      ctx.fillStyle = `rgba(${output},${0.14 * pulse})`;
      ctx.strokeStyle = `rgba(${output},${0.75 * pulse})`;
      roundedRect(ctx, xb + 4, y - 6, 22, 12, 5);
      ctx.fill();
      ctx.stroke();
    }
    for (let k = 0; k < 3; k += 1) {
      const v = 0.2 + 0.8 * Math.pow(0.5 + 0.5 * Math.sin(t * 0.7 + k * 2.1), 2);
      const x = xb + 32 + k * 6;
      const y = streamY(STREAMS - 1) + 6;
      line(ctx, x, y, x, y - h * 0.07 * v, accent, 0.35 + 0.5 * v, 3);
    }
  },
};
