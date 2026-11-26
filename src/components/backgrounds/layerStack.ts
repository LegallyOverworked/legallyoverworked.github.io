import { dot, flanks, hash, line, rgbStr, ring, strandA, strandB } from './draw';
import type { Scene } from './types';

type Point = [number, number];

const GRID = 3;
const NODES = GRID * GRID;
const BLOCKS = [
  [0, 4, 8],
  [2, 4, 6],
  [1, 3, 5, 7],
];
const CHANNELS = 7;
const CRAWLERS = 3;

export const layerStack: Scene = {
  still: 2,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const bg = rgbStr(pal.bg);

    flanks(w, dead).forEach(([x0, x1], side) => {
      const cx = (x0 + x1) / 2;
      const a = Math.max(8, Math.min((x1 - x0) * 0.44, h * 0.3));
      const b = a * 0.42;
      const gapY = h * 0.17;
      const thickness = Math.max(2, h * 0.014);
      const lift = a * 0.1;
      const P = (layer: number, u: number, v: number): Point => [
        cx + (u - v) * a,
        cy + layer * gapY + (u + v) * b + Math.sin(t * 0.8 + layer * 1.3 + side) * 1.5,
      ];
      const hasBlock = (layer: number, i: number) => BLOCKS[layer + 1].includes(i);
      const nodeUV = (i: number): Point => [((i % GRID) - 1) * 0.3, (Math.floor(i / GRID) - 1) * 0.3];
      const node = (layer: number, i: number): Point => {
        const [u, v] = nodeUV(i);
        const p = P(layer, u, v);
        return hasBlock(layer, i) ? [p[0], p[1] - lift] : p;
      };

      const hot = [0, 1, 2].map(() => new Array<number>(NODES).fill(0));
      const packets: { from: Point; to: Point; at: number; down: boolean }[] = [];
      for (let j = 0; j < CHANNELS; j += 1) {
        const i = Math.floor(hash(j, side, 1) * NODES);
        const upper = j % 2 ? 0 : -1;
        const period = 2.2 + hash(j, side, 2);
        const s = (t / period + hash(j, side, 3)) % 1;
        const down = s < 0.5;
        const q = down ? s * 2 : (s - 0.5) * 2;
        packets.push({ from: node(upper, i), to: node(upper + 1, i), at: down ? q : 1 - q, down });
        const arriving = (down ? upper + 1 : upper) + 1;
        const leaving = (down ? upper : upper + 1) + 1;
        if (q > 0.8) hot[arriving][i] = Math.max(hot[arriving][i], 1 - (q - 0.8) / 0.2);
        if (q < 0.15) hot[leaving][i] = Math.max(hot[leaving][i], 1 - q / 0.15);
      }

      for (let layer = 1; layer >= -1; layer -= 1) {
        const rgb = layer === 0 ? strandB(pal, cx / w) : strandA(pal, cx / w);
        const top = P(layer, -0.5, -0.5);
        const rightCorner = P(layer, 0.5, -0.5);
        const bottom = P(layer, 0.5, 0.5);
        const leftCorner = P(layer, -0.5, 0.5);
        const face = (points: Point[], fill: number, stroke: number) => {
          ctx.beginPath();
          ctx.moveTo(points[0][0], points[0][1]);
          for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
          ctx.closePath();
          ctx.fillStyle = `rgba(${bg},0.85)`;
          ctx.fill();
          ctx.fillStyle = `rgba(${rgb},${fill})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(${rgb},${stroke})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        };
        const drop = (p: Point): Point => [p[0], p[1] + thickness];
        face([leftCorner, bottom, drop(bottom), drop(leftCorner)], 0.2, 0.5);
        face([bottom, rightCorner, drop(rightCorner), drop(bottom)], 0.12, 0.5);
        face([top, rightCorner, bottom, leftCorner], 0.08, 0.6);
        for (const g of [-0.3, 0, 0.3]) {
          const p1 = P(layer, g, -0.42);
          const p2 = P(layer, g, 0.42);
          const p3 = P(layer, -0.42, g);
          const p4 = P(layer, 0.42, g);
          line(ctx, p1[0], p1[1], p2[0], p2[1], rgb, 0.16);
          line(ctx, p3[0], p3[1], p4[0], p4[1], rgb, 0.16);
        }

        for (let c = 0; c < CRAWLERS; c += 1) {
          const period = 2.6 + hash(c, layer + 2, side + 7);
          const lap = t / period + hash(c, layer + 2, side + 8);
          const leg = Math.floor(lap);
          const from = Math.floor(hash(leg, c + layer * 5 + 20, side) * NODES);
          const along = hash(leg, c, layer + side + 31) < 0.5;
          const step = along ? ((from % GRID) < GRID - 1 ? 1 : -1) : from + GRID < NODES ? GRID : -GRID;
          const [u0, v0] = nodeUV(from);
          const [u1, v1] = nodeUV(from + step);
          const s = lap - leg;
          const head = P(layer, u0 + (u1 - u0) * s, v0 + (v1 - v0) * s);
          const tail = P(layer, u0 + (u1 - u0) * Math.max(0, s - 0.25), v0 + (v1 - v0) * Math.max(0, s - 0.25));
          line(ctx, tail[0], tail[1], head[0], head[1], rgb, 0.5, 1.4);
          dot(ctx, head[0], head[1], 1.8, rgb, 0.9);
        }

        for (let i = 0; i < NODES; i += 1) {
          const heat = hot[layer + 1][i];
          const [u, v] = nodeUV(i);
          if (hasBlock(layer, i)) {
            const d = 0.075;
            const up = (p: Point): Point => [p[0], p[1] - lift];
            const l = P(layer, u - d, v + d);
            const bt = P(layer, u + d, v + d);
            const r = P(layer, u + d, v - d);
            const tp = P(layer, u - d, v - d);
            face([l, bt, up(bt), up(l)], 0.24, 0.6);
            face([bt, r, up(r), up(bt)], 0.14, 0.6);
            face([up(tp), up(r), up(bt), up(l)], heat > 0.3 ? 0.5 : 0.28, 0.7);
          }
          const n = node(layer, i);
          if (heat > 0) ring(ctx, n[0], n[1], 4 + 5 * (1 - heat), accent, 0.6 * heat);
          dot(ctx, n[0], n[1], 2 + 1.5 * heat, heat > 0.3 ? accent : rgb, 0.85);
        }
      }

      for (const q of packets) {
        ctx.setLineDash([2, 3]);
        line(ctx, q.from[0], q.from[1], q.to[0], q.to[1], strandA(pal, cx / w), 0.3);
        ctx.setLineDash([]);
        const x = q.from[0] + (q.to[0] - q.from[0]) * q.at;
        const y = q.from[1] + (q.to[1] - q.from[1]) * q.at;
        const rgb = q.down ? accent : ink;
        line(ctx, x, y + (q.down ? -9 : 9), x, y, rgb, 0.4, 1.4);
        dot(ctx, x, y, 2.4, rgb, 0.95);
      }
    });
  },
};
