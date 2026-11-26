import { TAU, clamp, dot, ease, flanks, line, rgbStr, strandA, strandB } from './draw';
import type { Scene } from './types';

const CYCLE = 5;

export const centralDogma: Scene = {
  still: 3.2,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const tt = t % CYCLE;
    const p = tt / CYCLE;
    const fade = clamp(tt / 0.3) * (1 - ease((tt - 4.6) / 0.4));
    const rna = rgbStr(pal.accent);
    const bg = rgbStr(pal.bg);
    const enzymeA = rgbStr(pal.chainB[0]);
    const enzymeB = rgbStr(pal.chainB[1]);
    const [left, right] = flanks(w, dead);
    const blob = (x: number, y: number, rx: number, ry: number, rgb: string) => {
      ctx.fillStyle = `rgba(${bg},0.8)`;
      ctx.beginPath();
      ctx.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), 0, 0, TAU);
      ctx.fill();
      ctx.fillStyle = `rgba(${rgb},${0.26 * fade})`;
      ctx.strokeStyle = `rgba(${rgb},${0.9 * fade})`;
      ctx.lineWidth = 1.4;
      ctx.fill();
      ctx.stroke();
    };

    {
      const [x0, x1] = left;
      const span = x1 - x0;
      const R = Math.min(h * 0.14, span * 0.13);
      const yc = cy - h * 0.11;
      const steps = 30;
      const particles: { x: number; y: number; depth: number; rgb: string }[] = [];
      for (let i = 0; i < steps; i += 1) {
        const u = i / (steps - 1);
        const x = x0 + u * span;
        const phase = u * Math.PI * 3 + t * 0.35;
        particles.push({ x, y: yc + Math.sin(phase) * R, depth: (Math.cos(phase) + 1) / 2, rgb: strandA(pal, x / w) });
        particles.push({ x, y: yc - Math.sin(phase) * R, depth: (1 - Math.cos(phase)) / 2, rgb: strandB(pal, x / w) });
      }
      for (let i = 0; i < steps; i += 2) {
        const a = particles[i * 2];
        const b = particles[i * 2 + 1];
        line(ctx, a.x, a.y, b.x, b.y, a.rgb, 0.1 + Math.min(a.depth, b.depth) * 0.2);
      }
      particles.sort((a, b) => a.depth - b.depth);
      for (const q of particles) dot(ctx, q.x, q.y, 0.9 + q.depth * 2, q.rgb, 0.25 + q.depth * 0.7);

      const px = x0 + span * (0.1 + 0.82 * p);
      const length = span * 0.7 * p;
      const strand: [number, number][] = [];
      for (let i = 0; i <= 44; i += 1) {
        const d = (i / 44) * length;
        strand.push([px - d * 0.8, yc + R * 1.2 + h * 0.2 * (1 - Math.exp(-d / (span * 0.14))) + 3.5 * Math.sin(d * 0.08 + t * 2)]);
      }
      ctx.strokeStyle = `rgba(${rna},${0.9 * fade})`;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (const q of strand) ctx.lineTo(q[0], q[1]);
      ctx.stroke();
      for (let i = 2; i < strand.length; i += 3) line(ctx, strand[i][0], strand[i][1], strand[i][0] + 1.5, strand[i][1] + 5, rna, 0.6 * fade, 1.2);
      blob(px, yc, R * 0.8, R * 1.3, enzymeB);
      dot(ctx, px, yc, 2, enzymeB, 0.9 * fade);
    }

    {
      const [x0, x1] = right;
      const span = x1 - x0;
      const ym = cy + h * 0.15;
      const wave = (x: number) => ym + 4 * Math.sin(x * 0.045 + 1);
      const bases = 46;
      ctx.strokeStyle = `rgba(${rna},0.85)`;
      ctx.lineWidth = 1.6;
      ctx.lineJoin = 'round';
      ctx.beginPath();
      for (let i = 0; i <= 60; i += 1) ctx.lineTo(x0 + (span * i) / 60, wave(x0 + (span * i) / 60));
      ctx.stroke();
      for (let i = 0; i <= bases; i += 1) {
        const x = x0 + (span * i) / bases;
        line(ctx, x, wave(x), x, wave(x) + (i % 3 ? 4 : 7), rna, i % 3 ? 0.45 : 0.8, 1.2);
      }
      const rx = x0 + span * (0.07 + 0.84 * p);
      const ry = wave(rx);
      const grown = p * 17;
      const exitX = rx - h * 0.01;
      const exitY = ry - h * 0.2;
      const beads: [number, number][] = [];
      for (let j = 0; j < 1 + Math.floor(grown); j += 1) {
        const s = j + (grown % 1);
        beads.push([exitX - s * h * 0.034 - 5 * Math.sin(s * 0.9), exitY - h * 0.075 * (1 - Math.exp(-s / 4)) + 5 * Math.sin(s * 0.8 + t * 1.5)]);
      }
      const residues = [strandA(pal, 0.9), rna, enzymeA, strandB(pal, 0.8)];
      const bead = Math.max(3, h * 0.016);
      for (let j = 0; j < beads.length - 1; j += 1) line(ctx, beads[j][0], beads[j][1], beads[j + 1][0], beads[j + 1][1], strandB(pal, 0.8), 0.8 * fade, 1.4);
      for (let j = beads.length - 1; j >= 0; j -= 1) {
        dot(ctx, beads[j][0], beads[j][1], bead + 1.4, bg, fade);
        dot(ctx, beads[j][0], beads[j][1], bead, residues[(Math.floor(grown) - j) % residues.length], 0.95 * fade);
      }
      blob(rx, ry - h * 0.095, h * 0.105, h * 0.085, enzymeA);
      blob(rx, ry + h * 0.04, h * 0.085, h * 0.04, enzymeB);
    }
  },
};
