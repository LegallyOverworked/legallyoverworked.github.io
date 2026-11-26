import { TAU, type Vec3, clamp, columns, dot, hash, line, rgbStr, ring, rot, strandA, strandB } from './draw';
import type { Scene } from './types';

type Point = [number, number];
type Kind = 'c' | 'w' | 'g' | 'r' | 'p' | 'q' | 'd' | 'h' | 'x' | 'k' | 'o' | 'm';

const COLS: [Kind, number][][] = [
  [['w', 0.5], ['c', 2], ['w', 3.5]],
  [['g', 1.25], ['r', 2.75]],
  [['p', 0.5], ['q', 2], ['d', 3.5]],
  [['h', 2]],
  [['x', 0.5], ['q', 2], ['k', 3.5]],
  [['o', 1.3], ['d', 3.2]],
  [['c', 0.5], ['m', 2], ['c', 3.5]],
];
const LINKS: [number, number, number][] = [
  [0, 0, 0], [0, 1, 0], [0, 1, 1], [0, 2, 1],
  [1, 0, 0], [1, 0, 1], [1, 1, 1], [1, 1, 2],
  [2, 0, 0], [2, 1, 0], [2, 2, 0],
  [3, 0, 0], [3, 0, 1], [3, 0, 2],
  [4, 0, 0], [4, 1, 0], [4, 1, 1], [4, 2, 1],
  [5, 0, 0], [5, 0, 1], [5, 1, 1], [5, 1, 2],
];

const HOP_TIME = 3.4;
const TRAVEL = 0.72;
const PRE_ROLL = 7;

const CLOUD: Vec3[] = (() => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: 46 }, (_, i): Vec3 => {
    const y = 1 - (2 * (i + 0.5)) / 46;
    const r = Math.sqrt(1 - y * y);
    return [Math.cos(i * golden) * r, y, Math.sin(i * golden) * r];
  });
})();

function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  t: number,
  rgbA: string,
  rgbB: string,
  hot: number,
) {
  const s = radius * (1 + 0.1 * hot);
  const pts = CLOUD.map((p, i) => {
    const q = rot(p, t * 0.45, 0.35);
    return { x: x + q[0] * s, y: y + q[1] * s, depth: (q[2] + 1) / 2, alt: i % 3 === 0 };
  }).sort((a, b) => a.depth - b.depth);
  for (const p of pts) {
    dot(ctx, p.x, p.y, 0.6 + 1.7 * p.depth + 0.5 * hot, p.alt ? rgbB : rgbA, clamp(0.18 + 0.7 * p.depth + 0.2 * hot));
  }
}

function drawGlyph(
  ctx: CanvasRenderingContext2D,
  kind: Kind,
  x: number,
  y: number,
  rgb: string,
  hot: number,
  blink: number,
  t: number,
) {
  const stroke = 0.5 + 0.4 * hot;
  const fill = 0.07 + 0.3 * hot;
  const style = () => {
    ctx.strokeStyle = `rgba(${rgb},${stroke})`;
    ctx.fillStyle = `rgba(${rgb},${fill})`;
    ctx.lineWidth = 1;
  };
  const box = (x0: number, y0: number, bw: number, bh: number, r: number) => {
    style();
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0);
    ctx.arcTo(x0 + bw, y0, x0 + bw, y0 + bh, r);
    ctx.arcTo(x0 + bw, y0 + bh, x0, y0 + bh, r);
    ctx.arcTo(x0, y0 + bh, x0, y0, r);
    ctx.arcTo(x0, y0, x0 + bw, y0, r);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };
  style();
  switch (kind) {
    case 'c':
      ctx.beginPath();
      ctx.arc(x, y, 5.5, 0, TAU);
      ctx.fill();
      ctx.stroke();
      dot(ctx, x, y, 1.6, rgb, 0.35 + 0.55 * blink);
      break;
    case 'g':
      ctx.beginPath();
      ctx.moveTo(x, y - 8.5);
      ctx.lineTo(x + 8.5, y);
      ctx.lineTo(x, y + 8.5);
      ctx.lineTo(x - 8.5, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      break;
    case 'q':
      box(x - 11, y - 5.5, 22, 11, 5.5);
      for (let i = -1; i <= 1; i += 1) line(ctx, x + i * 4.5, y - 2.5, x + i * 4.5, y + 2.5, rgb, 0.55);
      break;
    case 'd':
      ctx.beginPath();
      ctx.moveTo(x - 7, y - 5);
      ctx.lineTo(x - 7, y + 5);
      ctx.ellipse(x, y + 5, 7, 2.6, 0, Math.PI, 0, true);
      ctx.lineTo(x + 7, y - 5);
      ctx.ellipse(x, y - 5, 7, 2.6, 0, 0, TAU);
      ctx.fill();
      ctx.stroke();
      break;
    case 'w':
      box(x - 9, y - 6.5, 18, 13, 2);
      line(ctx, x - 9, y - 2.5, x + 9, y - 2.5, rgb, stroke);
      dot(ctx, x - 6.3, y - 4.5, 0.9, rgb, 0.8);
      dot(ctx, x - 3.6, y - 4.5, 0.9, rgb, 0.8);
      break;
    case 'r':
      box(x - 8, y - 7.5, 16, 6.5, 1.5);
      box(x - 8, y + 1, 16, 6.5, 1.5);
      dot(ctx, x - 5, y - 4.2, 1.1, rgb, 0.35 + 0.55 * blink);
      dot(ctx, x - 5, y + 4.3, 1.1, rgb, 0.9 - 0.55 * blink);
      line(ctx, x - 1, y - 4.2, x + 5, y - 4.2, rgb, 0.5);
      line(ctx, x - 1, y + 4.3, x + 5, y + 4.3, rgb, 0.5);
      break;
    case 'p':
      for (let i = -1; i <= 1; i += 1) {
        line(ctx, x + i * 3.5, y - 6, x + i * 3.5, y - 9, rgb, stroke);
        line(ctx, x + i * 3.5, y + 6, x + i * 3.5, y + 9, rgb, stroke);
        line(ctx, x - 6, y + i * 3.5, x - 9, y + i * 3.5, rgb, stroke);
        line(ctx, x + 6, y + i * 3.5, x + 9, y + i * 3.5, rgb, stroke);
      }
      box(x - 6, y - 6, 12, 12, 1.5);
      box(x - 2.5, y - 2.5, 5, 5, 0.8);
      break;
    case 'x':
      for (let i = 0; i < 8; i += 1) {
        const a = t * 0.5 + (i * TAU) / 8;
        line(ctx, x + Math.cos(a) * 5, y + Math.sin(a) * 5, x + Math.cos(a) * 8.2, y + Math.sin(a) * 8.2, rgb, stroke, 1.7);
      }
      style();
      ctx.beginPath();
      ctx.arc(x, y, 5.2, 0, TAU);
      ctx.fill();
      ctx.stroke();
      dot(ctx, x, y, 1.7, rgb, 0.8);
      break;
    case 'k':
      box(x - 3.5, y - 9.5, 13, 13, 2);
      box(x - 6.5, y - 6.5, 13, 13, 2);
      box(x - 9.5, y - 3.5, 13, 13, 2);
      break;
    case 'm':
      box(x - 10, y - 6.5, 20, 13, 2);
      ctx.strokeStyle = `rgba(${rgb},0.85)`;
      ctx.lineWidth = 1;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 8; i += 1) {
        ctx.lineTo(x - 7 + i * 1.75, y + 3.2 * Math.sin(i * 1.25 + t * 1.4) * Math.cos(i * 0.6 - t * 0.5));
      }
      ctx.stroke();
      break;
    case 'h':
      box(x - 11, y - 11, 22, 22, 3);
      break;
    case 'o':
      break;
  }
}

export const system: Scene = {
  still: 2,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const xs = columns(w, dead);
    const rowH = h * 0.155;
    const tt = t + PRE_ROLL;
    const cloudR = Math.max(4, Math.min((xs[5] - xs[4]) * 0.3, rowH * 0.62, 34));
    const pos = (c: number, i: number): Point => [xs[c], cy + (COLS[c][i][1] - 2) * rowH];
    const HALF: Record<Kind, number> = { c: 5.5, g: 8.5, q: 11, d: 7, h: 11, w: 9, r: 8, p: 9, x: 8.2, k: 9.5, m: 10, o: cloudR + 3 };
    const packetRgb = rgbStr(pal.accent);
    const hot = COLS.map((col) => col.map(() => 0));
    const packets: Point[] = [];
    const trail = (at: (d: number) => Point, d: number, segments: number, width: number) => {
      for (let q = segments; q >= 1; q -= 1) {
        const u = at(d - q * 4);
        const v = at(d - (q - 1) * 4);
        line(ctx, u[0], u[1], v[0], v[1], packetRgb, 0.5 * (1 - q / (segments + 1)), width);
      }
      packets.push(at(d));
    };

    const rail = (a: Point, b: Point, ay: number, by: number, railY: number, rgb: string, phase: number) => {
      ctx.strokeStyle = `rgba(${rgb},0.2)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(a[0], ay);
      ctx.arcTo(a[0], railY, b[0], railY, 6);
      ctx.arcTo(b[0], railY, b[0], by, 6);
      ctx.lineTo(b[0], by);
      ctx.stroke();
      ctx.setLineDash([]);
      const l1 = Math.abs(railY - ay);
      const l2 = Math.abs(b[0] - a[0]);
      const l3 = Math.abs(by - railY);
      const len = l1 + l2 + l3;
      const s = (((tt / (HOP_TIME * 1.6) - phase) % 1) + 1) % 1;
      const dir = b[0] < a[0] ? -1 : 1;
      const at = (d: number): Point => {
        const q = clamp(d, 0, len);
        if (q <= l1) return [a[0], ay + ((railY - ay) * q) / (l1 || 1)];
        if (q <= l1 + l2) return [a[0] + dir * (q - l1), railY];
        return [b[0], railY + ((by - railY) * (q - l1 - l2)) / (l3 || 1)];
      };
      trail(at, len * s, 4, 1.4);
    };
    const topFrom = pos(2, 0);
    const topTo = pos(0, 0);
    rail(topFrom, topTo, topFrom[1] - 11, topTo[1] - 8.5, cy - h * 0.325, strandB(pal, 0.2), 0.15);
    const bottomFrom = pos(6, 2);
    const bottomTo = pos(4, 2);
    rail(bottomFrom, bottomTo, bottomFrom[1] + 7.5, bottomTo[1] + 11.5, cy + h * 0.325, strandB(pal, 0.8), 0.6);

    for (const [c, i, j] of LINKS) {
      const a = pos(c, i);
      const b = pos(c + 1, j);
      const n = COLS[c].length;
      const xa = a[0] + HALF[COLS[c][i][0]] + 2;
      const xb = b[0] - HALF[COLS[c + 1][j][0]] - 2;
      const mx = (xa + xb) / 2 + (i - (n - 1) / 2) * 6;
      const dy = b[1] - a[1];
      ctx.strokeStyle = `rgba(${strandA(pal, a[0] / w)},0.22)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(xa, a[1]);
      if (Math.abs(dy) < 1) {
        ctx.lineTo(xb, b[1]);
      } else {
        const r = Math.min(6, Math.abs(dy) / 2);
        ctx.arcTo(mx, a[1], mx, b[1], r);
        ctx.arcTo(mx, b[1], xb, b[1], r);
        ctx.lineTo(xb, b[1]);
      }
      ctx.stroke();

      const l1 = mx - xa;
      const l2 = Math.abs(dy);
      const len = l1 + l2 + (xb - mx);
      const dir = dy < 0 ? -1 : 1;
      const at = (d: number): Point => {
        const q = clamp(d, 0, len);
        if (q <= l1) return [xa + q, a[1]];
        if (q <= l1 + l2) return [mx, a[1] + dir * (q - l1)];
        return [mx + (q - l1 - l2), b[1]];
      };
      const s = (((tt / HOP_TIME - c * 0.3 - hash(c, i, j) * 0.3) % 1) + 1) % 1;
      if (s < TRAVEL) {
        trail(at, (len * s) / TRAVEL, 5, 1.5);
      } else {
        const q = (s - TRAVEL) / (1 - TRAVEL);
        hot[c + 1][j] = Math.max(hot[c + 1][j], 1 - q);
        ring(ctx, b[0], b[1], HALF[COLS[c + 1][j][0]] + 3 + 9 * q, packetRgb, 0.4 * (1 - q));
      }
    }

    for (let c = 0; c < COLS.length; c += 1) {
      for (let i = 0; i < COLS[c].length; i += 1) {
        const p = pos(c, i);
        const kind = COLS[c][i][0];
        const rgb = c % 2 ? strandB(pal, p[0] / w) : strandA(pal, p[0] / w);
        if (kind === 'o') drawCloud(ctx, p[0], p[1], cloudR, t, strandA(pal, p[0] / w), strandB(pal, p[0] / w), hot[c][i]);
        else drawGlyph(ctx, kind, p[0], p[1], rgb, hot[c][i], 0.5 + 0.5 * Math.sin(t * 1.6 + c * 1.9 + i * 2.7), t);
      }
    }
    for (const p of packets) dot(ctx, p[0], p[1], 2.1, packetRgb, 0.95);
  },
};
