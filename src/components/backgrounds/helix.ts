import { dot, line, strandA, strandB } from './draw';
import type { Scene } from './types';

const PARTICLES = 64;
const TURNS = Math.PI * 4;

export const helix: Scene = {
  still: 0,
  draw(ctx, w, h, t, pal) {
    const time = t * 0.35;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(h * 0.32, w * 0.12);
    const ps: { x: number; y: number; depth: number; color: string }[] = [];
    for (let i = 0; i < PARTICLES; i += 1) {
      const u = i / (PARTICLES - 1);
      const x = (u - 0.5) * w * 0.9 + cx;
      const phase = u * TURNS + time;
      ps.push({ x, y: cy + Math.sin(phase) * radius, depth: (Math.cos(phase) + 1) / 2, color: strandA(pal, u) });
      ps.push({ x, y: cy - Math.sin(phase) * radius, depth: (1 - Math.cos(phase)) / 2, color: strandB(pal, u) });
    }
    for (let i = 0; i < PARTICLES; i += 4) {
      const a = ps[i * 2];
      const b = ps[i * 2 + 1];
      line(ctx, a.x, a.y, b.x, b.y, a.color, 0.1 + Math.min(a.depth, b.depth) * 0.22);
    }
    ps.sort((a, b) => a.depth - b.depth);
    for (const p of ps) dot(ctx, p.x, p.y, 1 + p.depth * 2.4, p.color, 0.25 + p.depth * 0.7);
  },
};
