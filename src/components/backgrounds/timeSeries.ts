import { dot, hash, line, rgbStr, ring, strandA, strandB } from './draw';
import type { Scene } from './types';

const NOW = 0.74;
const SPAN = 40;
const SPEED = 1.1;
const STEPS = 40;

const signal = (tau: number) => 0.9 * Math.sin(tau * 0.42) + 0.5 * Math.sin(tau * 1.1 + 1) + 0.25 * Math.sin(tau * 0.19 + 2);
const noise = (n: number) => (hash(n, 3, 1) - 0.5) * 0.9;
const spike = (n: number) => (hash(n, 7, 2) > 0.93 ? (hash(n, 8, 3) > 0.5 ? 1.5 : -1.5) : 0);
const value = (n: number) => signal(n) + noise(n) + spike(n);

export const timeSeries: Scene = {
  still: 3,
  draw(ctx, w, h, t, pal) {
    const cy = h / 2;
    const x0 = w * 0.05;
    const x1 = w * 0.95;
    const amp = Math.min(h * 0.11, w * 0.08);
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const X = (u: number) => x0 + (x1 - x0) * u;
    const Y = (v: number) => cy - v * amp;
    const tauAt = (u: number) => t * SPEED + (u - NOW) * SPAN;
    const uOf = (n: number) => NOW + (n - t * SPEED) / SPAN;
    const latest = Math.floor(tauAt(NOW));
    const first = Math.ceil(tauAt(0));
    const into = tauAt(NOW) - latest;
    const current = value(latest) + (value(latest + 1) - value(latest)) * into;

    ctx.setLineDash([2, 4]);
    line(ctx, X(NOW), cy - h * 0.3, X(NOW), cy + h * 0.3, ink, 0.3);
    ctx.setLineDash([]);

    const offset = current - signal(tauAt(NOW));
    const forecast = (u: number) => signal(tauAt(u)) + offset * Math.exp(-(u - NOW) * 14);
    const cone = (u: number) => (0.25 + (3.2 * (u - NOW)) / (1 - NOW)) * amp * 0.55;
    const ahead = (i: number) => NOW + ((1 - NOW) * i) / STEPS;
    const coneFill = ctx.createLinearGradient(X(NOW), 0, x1, 0);
    coneFill.addColorStop(0, `rgba(${strandB(pal, 0.8)},0.16)`);
    coneFill.addColorStop(1, `rgba(${strandB(pal, 1)},0.03)`);
    ctx.fillStyle = coneFill;
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i += 1) ctx.lineTo(X(ahead(i)), Y(forecast(ahead(i))) - cone(ahead(i)));
    for (let i = STEPS; i >= 0; i -= 1) ctx.lineTo(X(ahead(i)), Y(forecast(ahead(i))) + cone(ahead(i)));
    ctx.closePath();
    ctx.fill();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = `rgba(${strandB(pal, 0.9)},0.85)`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let i = 0; i <= STEPS; i += 1) ctx.lineTo(X(ahead(i)), Y(forecast(ahead(i))));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = `rgba(${strandB(pal, 0.3)},0.4)`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i <= 90; i += 1) ctx.lineTo(X((NOW * i) / 90), Y(signal(tauAt((NOW * i) / 90) - 1.2)));
    ctx.stroke();

    const stroke = ctx.createLinearGradient(x0, 0, X(NOW), 0);
    stroke.addColorStop(0, `rgba(${strandA(pal, 0)},0.85)`);
    stroke.addColorStop(1, `rgba(${strandA(pal, 0.75)},0.85)`);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(X(0), Y(value(first - 1) + (value(first) - value(first - 1)) * (tauAt(0) - (first - 1))));
    for (let n = first; n <= latest; n += 1) ctx.lineTo(X(uOf(n)), Y(value(n)));
    ctx.lineTo(X(NOW), Y(current));
    ctx.stroke();
    for (let n = first; n <= latest; n += 1) {
      const u = uOf(n);
      if (spike(n)) {
        dot(ctx, X(u), Y(value(n)), 3, accent, 0.95);
        ring(ctx, X(u), Y(value(n)), 7 + 2 * Math.sin(t * 3 + n), accent, 0.6, 1.2);
      } else {
        dot(ctx, X(u), Y(value(n)), 1.8, strandA(pal, u), 0.75);
      }
    }
    dot(ctx, X(NOW), Y(current), 3.2, ink, 0.95);
    ring(ctx, X(NOW), Y(current), 6 + 3 * into, ink, 0.5 * (1 - into), 1.2);
  },
};
