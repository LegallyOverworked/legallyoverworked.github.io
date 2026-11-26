import { type Vec3, dot, ease, flanks, hash, line, rgbStr, ring, rng, rot, strandA, strandB } from './draw';
import type { Scene } from './types';

interface Embedding {
  p: Vec3;
  cluster: number;
}

const CLOUDS: Embedding[][] = (() => {
  const r = rng(9);
  const centres: Vec3[] = [
    [0.5, 0.2, 0.1],
    [-0.4, 0.4, -0.2],
    [0.1, -0.5, 0.4],
    [-0.3, -0.2, -0.5],
  ];
  return [0, 1].map(() =>
    Array.from({ length: 64 }, (_, i): Embedding => {
      const c = centres[i % 4];
      return { p: [c[0] + (r() - 0.5) * 0.5, c[1] + (r() - 0.5) * 0.5, c[2] + (r() - 0.5) * 0.5], cluster: i % 4 };
    }),
  );
})();

const NEIGHBOURS = 5;
const QUERY_EVERY = 2.5;

export const embeddings: Scene = {
  still: 1.5,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    flanks(w, dead).forEach(([x0, x1], side) => {
      const cx = (x0 + x1) / 2;
      const R = Math.max(1, Math.min(h * 0.34, (x1 - x0) * 0.46));
      const yaw = t * 0.25 + side * 2;
      const pitch = 0.35;
      const cloud = CLOUDS[side];
      const project = (p: Vec3) => {
        const q = rot(p, yaw, pitch);
        return { x: cx + q[0] * R, y: cy - q[1] * R, depth: (q[2] + 1) / 2 };
      };

      for (const axis of [[1, 0, 0], [0, 1, 0], [0, 0, 1]] as Vec3[]) {
        const a = rot([axis[0] * 0.95, axis[1] * 0.95, axis[2] * 0.95], yaw, pitch);
        line(ctx, cx + a[0] * R, cy - a[1] * R, cx - a[0] * R, cy + a[1] * R, strandA(pal, cx / w), 0.16);
      }

      const turn = Math.floor(t / QUERY_EVERY);
      const move = ease((t / QUERY_EVERY - turn) / 0.35);
      const target = (k: number): Vec3 => {
        const s = cloud[Math.floor(hash(k, side, 5) * cloud.length)].p;
        return [s[0] + 0.12, s[1] - 0.1, s[2] + 0.08];
      };
      const from = target(turn - 1);
      const to = target(turn);
      const query: Vec3 = [from[0] + (to[0] - from[0]) * move, from[1] + (to[1] - from[1]) * move, from[2] + (to[2] - from[2]) * move];
      const nearest = new Set(
        cloud
          .map((e, i) => ({ i, d: Math.hypot(e.p[0] - query[0], e.p[1] - query[1], e.p[2] - query[2]) }))
          .sort((a, b) => a.d - b.d)
          .slice(0, NEIGHBOURS)
          .map((e) => e.i),
      );

      const q = project(query);
      const points = cloud.map((e, i) => ({ ...project(e.p), cluster: e.cluster, i })).sort((a, b) => a.depth - b.depth);
      for (const p of points) if (nearest.has(p.i)) line(ctx, q.x, q.y, p.x, p.y, accent, 0.2 + 0.5 * move, 1.1);
      for (const p of points) {
        const near = nearest.has(p.i);
        const rgb = near ? accent : p.cluster % 2 ? strandB(pal, p.x / w) : strandA(pal, p.x / w);
        dot(ctx, p.x, p.y, 1 + 2.2 * p.depth + (near ? 1.2 : 0), rgb, 0.22 + 0.65 * p.depth);
      }
      dot(ctx, q.x, q.y, 4, ink, 0.95);
      ring(ctx, q.x, q.y, 7 + 2 * Math.sin(t * 3), ink, 0.5, 1.2);
    });
  },
};
