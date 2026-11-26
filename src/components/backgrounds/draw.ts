import type { Palette, Rgb } from './types';

export const TAU = Math.PI * 2;

export type Vec3 = [number, number, number];

export const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

export const ease = (x: number) => {
  const c = clamp(x);
  return c * c * (3 - 2 * c);
};

export function rng(seed: number) {
  let s = seed;
  return () => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const hash = (a: number, b: number, c: number) => {
  const x = Math.sin(a * 127.1 + b * 311.7 + c * 74.7 + 1.3) * 43758.5453;
  return x - Math.floor(x);
};

export const rgbStr = (c: Rgb) => c.join(',');

export const mixRgb = (p: Rgb, q: Rgb, t: number) =>
  [0, 1, 2].map((i) => Math.round(p[i] + (q[i] - p[i]) * t)).join(',');

export const strandA = (pal: Palette, u: number) => mixRgb(pal.a0, pal.a1, clamp(u));
export const strandB = (pal: Palette, u: number) => mixRgb(pal.b0, pal.b1, clamp(u));

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rgb: string, alpha: number) {
  ctx.fillStyle = `rgba(${rgb},${alpha})`;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, TAU);
  ctx.fill();
}

export function line(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  rgb: string,
  alpha: number,
  width = 1,
) {
  ctx.strokeStyle = `rgba(${rgb},${alpha})`;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

export function ring(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rgb: string,
  alpha: number,
  width = 1,
) {
  ctx.strokeStyle = `rgba(${rgb},${alpha})`;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, Math.max(0, r), 0, TAU);
  ctx.stroke();
}

export function columns(w: number, dead: number, rightPad = 0): number[] {
  const l0 = w * 0.05;
  const l1 = w / 2 - dead - w * 0.03;
  const r0 = w / 2 + dead + w * 0.03;
  const r1 = w * 0.95 - rightPad;
  return [l0, (l0 + l1) / 2, l1, w / 2, r0, (r0 + r1) / 2, r1];
}

export function rot(p: Vec3, yaw: number, pitch: number): Vec3 {
  const cy = Math.cos(yaw);
  const sy = Math.sin(yaw);
  const cp = Math.cos(pitch);
  const sp = Math.sin(pitch);
  const x = p[0] * cy + p[2] * sy;
  const z = -p[0] * sy + p[2] * cy;
  return [x, p[1] * cp - z * sp, p[1] * sp + z * cp];
}

export function flanks(w: number, dead: number): [number, number][] {
  return [
    [w * 0.05, w / 2 - dead - w * 0.03],
    [w / 2 + dead + w * 0.03, w * 0.95],
  ];
}

export function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
