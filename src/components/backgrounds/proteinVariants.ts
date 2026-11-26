import { TAU, type Vec3, clamp, ease, line, mixRgb, rgbStr, ring } from './draw';
import {
  ALPHA_BETA_FOLD,
  CYCLE,
  type Element,
  type Fold,
  HELIX_BUNDLE_FOLD,
  type Point,
  type Sample,
  buildFold,
  dockingPhase,
  drawFold,
  drawLigand,
  flankGeometry,
  hexagon,
  makeLigand,
  mixVec,
} from './proteinRibbon';
import type { Palette, Scene } from './types';


const delayed = (t: number, delay: number) => (t < delay ? 0 : (t - delay) % CYCLE);


function drawTube(ctx: CanvasRenderingContext2D, pts: Point[], width: number, pal: Palette, alpha: number) {
  if (pts.length < 2 || alpha <= 0) return;
  const path = () => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i += 1) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
  };
  ctx.globalAlpha = alpha;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgb(${rgbStr(pal.bg)})`;
  ctx.lineWidth = width + 3.5;
  path();
  ctx.strokeStyle = `rgb(${mixRgb(pal.accent, pal.shadow, 0.38)})`;
  ctx.lineWidth = width;
  path();
  ctx.strokeStyle = `rgb(${rgbStr(pal.accent)})`;
  ctx.lineWidth = width * 0.5;
  path();
  ctx.globalAlpha = 1;
}

export const proteinCut: Scene = {
  still: 2.2,
  draw(ctx, w, h, t, pal, dead) {
    const { scale, left, right } = flankGeometry(w, h, dead);
    if (scale <= 0.5) return;
    const cy = h / 2 + h * 0.07;
    const ink = rgbStr(pal.ink);
    const POINTS = 26;

    const enzyme = (fold: Fold, cx: number, centreY: number, s: number, yaw: number, pitch: number, tt: number, side: number) => {
      const site = drawFold(ctx, fold, cx, centreY, s, yaw, pitch, pal).site;
      const arrive = ease(tt / 1.9);
      const cut = ease((tt - 2.5) / 1.8);
      const alpha = clamp(tt / 0.4) * (1 - ease((tt - 3.7) / 0.8));
      if (alpha <= 0) return;
      const ex = 0.995;
      const ey = -0.1;
      const half = 10.5 * s;
      const point = (u: number, isLeft: boolean): Point => {
        let x = u * half + side * 18 * s * (1 - arrive);
        let y = -1.6 * s * (1 - u * u) + 0.7 * s * Math.sin(u * 5 + t * 1.6) * (1 - 0.6 * arrive + 0.6 * cut);
        if (cut > 0) {
          const angle = (isLeft ? 0.5 : -0.5) * cut;
          const rx = x;
          x = rx * Math.cos(angle) - y * Math.sin(angle) + (isLeft ? -1 : 1) * 4.5 * s * cut;
          y = rx * Math.sin(angle) + y * Math.cos(angle) - 2.5 * s * cut;
        }
        return [site[0] + ex * x - ey * y, site[1] + ey * x + ex * y];
      };
      const gap = 0.07 * cut;
      const halfTube = (from: number, to: number, isLeft: boolean) =>
        Array.from({ length: POINTS }, (_, i) => point(from + ((to - from) * i) / (POINTS - 1), isLeft));

      if (tt > 1.6 && tt < 2.5) {
        const q = (tt - 1.6) / 0.9;
        ring(ctx, site[0], site[1], s * (5 - 2.4 * q), ink, 0.25 + 0.5 * q, 1.2);
      }
      if (tt >= 2.5 && tt < 3) {
        const q = (tt - 2.5) / 0.5;
        for (let k = 0; k < 7; k += 1) {
          const a = (k * TAU) / 7 + 0.4;
          line(
            ctx,
            site[0] + Math.cos(a) * s * (2 + 5 * q),
            site[1] + Math.sin(a) * s * (2 + 5 * q),
            site[0] + Math.cos(a) * s * (3.5 + 8 * q),
            site[1] + Math.sin(a) * s * (3.5 + 8 * q),
            ink,
            0.8 * (1 - q),
            1.3,
          );
        }
      }
      const width = Math.max(3, 1.15 * s);
      if (cut > 0) {
        drawTube(ctx, halfTube(-1, -gap, true), width, pal, alpha);
        drawTube(ctx, halfTube(gap, 1, false), width, pal, alpha);
      } else {
        drawTube(ctx, halfTube(-1, 1, true), width, pal, alpha);
      }
    };

    enzyme(ALPHA_BETA_FOLD, left + scale * 2, cy, scale, 0.6 + 0.25 * Math.sin(t * 0.5), 0.3 + 0.08 * Math.sin(t * 0.37), t % CYCLE, -1);
    enzyme(
      HELIX_BUNDLE_FOLD,
      right - scale * 2,
      cy - h * 0.03,
      scale * 1.12,
      -0.45 + 0.25 * Math.sin(t * 0.45 + 1.5),
      0.22 + 0.08 * Math.sin(t * 0.4),
      delayed(t, 0.6),
      1,
    );
  },
};


const up = (x: number): Element => ({ type: 'E', p: [x, -14, 0], q: [x, -4, 0], flat: [1, 0, 0] });

const TWO_DOMAIN_FOLD = buildFold(
  [
    { type: 'H', p: [7, -4, 8.5], q: [7, -14, 8.5], phase: 0.4 },
    up(5),
    { type: 'H', p: [2, -4, -8.5], q: [2, -14, -8.5], phase: 1.6 },
    up(0),
    { type: 'H', p: [-8, -4, 8.5], q: [-8, -14, 8.5], phase: 2.4 },
    up(-5),
    { type: 'H', p: [-7, 5, 4], q: [8, 5, 4], phase: 0.3, domain: 1 },
    { type: 'H', p: [8, 10, 2], q: [-6, 10, 2], phase: 1.2, domain: 1 },
    { type: 'H', p: [-6, 7.5, -5], q: [8, 6.5, -5], phase: 2.1, domain: 1 },
  ],
  [3, 0.5, 1],
);
const HINGE: [number, number] = [-8, 0.5];
const LID_OPEN = 0.5;
const LID_CLOSED = 0.06;

const SINGLE_RING = makeLigand([...hexagon(0, 0), [-2, 0, 1]]);

export const proteinHinge: Scene = {
  still: 2.3,
  draw(ctx, w, h, t, pal, dead) {
    const geometry = flankGeometry(w, h, dead);
    const scale = geometry.scale * 0.96;
    if (scale <= 0.5) return;
    const cy = h / 2 + 1.75 * scale;
    const ink = rgbStr(pal.ink);
    const substratePal: Palette = { ...pal, ink: pal.accent, hetero: pal.ink };

    const enzyme = (cx: number, yaw: number, tt: number, side: number) => {
      const closing = ease((tt - 1.7) / 0.7) - ease((tt - 3) / 0.6);
      const lid = LID_OPEN - (LID_OPEN - LID_CLOSED) * closing;
      const swing = (s: Sample) => {
        if (!s.domain) return s;
        const a = lid * s.domain;
        const x = s.p[0] - HINGE[0];
        const y = s.p[1] - HINGE[1];
        const p: Vec3 = [HINGE[0] + x * Math.cos(a) - y * Math.sin(a), HINGE[1] + x * Math.sin(a) + y * Math.cos(a), s.p[2]];
        const n: Vec3 = [s.n[0] * Math.cos(a) - s.n[1] * Math.sin(a), s.n[0] * Math.sin(a) + s.n[1] * Math.cos(a), s.n[2]];
        return { p, n, w: s.w };
      };
      const site = drawFold(ctx, TWO_DOMAIN_FOLD, cx, cy, scale, yaw + 0.14 * Math.sin(t * 0.5), 0.12 + 0.05 * Math.sin(t * 0.4), pal, {
        transform: swing,
      }).site;

      const arrive = ease(tt / 1.7);
      const split = ease((tt - 2.6) / 0.3);
      const leave = ease((tt - 3.5) / 1.1);
      const alpha = clamp(tt / 0.4) * (1 - ease((tt - 3.9) / 0.8));
      const bond = 1.4 * scale;
      const x = site[0] + side * scale * 14 * (1 - arrive);
      const y = site[1] - scale * 3 * (1 - arrive) * (1 - arrive);
      const angle = 0.25 * side + 1.6 * (1 - arrive);
      if (tt > 2.4 && tt < 3.3) {
        const q = (tt - 2.4) / 0.9;
        ring(ctx, site[0], site[1], scale * (3 + 10 * q), ink, 0.55 * (1 - q), 1.2);
      }
      if (alpha <= 0) return;
      const offset = 1.5 * bond + leave * scale * 9;
      const ux = Math.cos(angle);
      const uy = Math.sin(angle);
      const lift = leave * scale * 5;
      const ringA: Point = [x - ux * offset + side * leave * scale * 6, y - uy * offset - lift];
      const ringB: Point = [x + ux * offset + side * leave * scale * 10, y + uy * offset + lift * 0.6];
      if (split < 1) {
        ctx.globalAlpha = alpha * (1 - split);
        line(ctx, ringA[0] + ux * bond, ringA[1] + uy * bond, ringB[0] - ux * bond, ringB[1] - uy * bond, rgbStr(pal.accent), 1, Math.max(1.5, bond * 0.24));
        ctx.globalAlpha = 1;
      }
      drawLigand(ctx, SINGLE_RING, ringA[0], ringA[1], angle + leave * 1.2, bond, substratePal, alpha, [], 0);
      drawLigand(ctx, SINGLE_RING, ringB[0], ringB[1], angle + Math.PI - leave * 1.4, bond, substratePal, alpha, [], 0);
    };

    enzyme(geometry.left + scale * 3.5, Math.PI, t % CYCLE, -1);
    enzyme(geometry.right - scale * 3.5, 0, delayed(t, 0.6), 1);
  },
};


export const proteinFold: Scene = {
  still: 3.4,
  draw(ctx, w, h, t, pal, dead) {
    const { scale, left, right } = flankGeometry(w, h, dead);
    if (scale <= 0.5) return;
    const cy = h / 2 + h * 0.02;
    const ink = rgbStr(pal.ink);

    const chain = (fold: Fold, cx: number, s: number, yaw: number, pitch: number, tt: number, seed: number) => {
      const progress = ((tt - 0.3) / 2.7) * 2.2;
      const unfolding = 1 - ease((tt - 4.3) / 0.6);
      const loose = (c: number): Vec3 => [
        -15 + 30 * c,
        6 * Math.sin(c * TAU * 2.2 + seed) + 2.2 * Math.sin(c * TAU * 7 + seed),
        5 * Math.cos(c * TAU * 3.1 + seed),
      ];
      const condense = (sample: Sample) => {
        const q = ease((progress - sample.t * 1.3) / 0.9) * unfolding;
        const thin = Math.min(sample.w, 0.4);
        return { p: mixVec(loose(sample.t), sample.p, q), n: sample.n, w: thin + (sample.w - thin) * q * q };
      };
      drawFold(ctx, fold, cx, cy, s, yaw, pitch, pal, { transform: condense });
      if (tt > 3 && tt < 4) {
        const q = tt - 3;
        ring(ctx, cx, cy, s * (13 + 4 * q), ink, 0.4 * (1 - q), 1.2);
      }
    };

    chain(ALPHA_BETA_FOLD, left, scale, 0.5 + 0.25 * Math.sin(t * 0.5), 0.28, t % CYCLE, 0.7);
    chain(HELIX_BUNDLE_FOLD, right, scale * 1.12, -0.4 + 0.25 * Math.sin(t * 0.45 + 1.5), 0.2, delayed(t, 0.6), 2.1);
  },
};


export const proteinPair: Scene = {
  still: 3.2,
  draw(ctx, w, h, t, pal, dead) {
    const geometry = flankGeometry(w, h, dead);
    const scale = geometry.scale * 0.7;
    if (scale <= 0.4) return;
    const cy = h / 2 + h * 0.06;
    const ink = rgbStr(pal.ink);

    const pair = (cx: number, yaw: number, tt: number, side: number) => {
      const phase = dockingPhase(tt);
      const receptor = drawFold(ctx, ALPHA_BETA_FOLD, cx, cy, scale, yaw + 0.2 * Math.sin(t * 0.5), 0.3, pal);
      const distance = scale * (10 * (1 - phase.approach) + 9 * phase.release);
      const px = cx + side * 15.5 * scale + side * 0.92 * distance;
      const py = cy - 7 * scale - 0.38 * distance;
      const partner = drawFold(
        ctx,
        HELIX_BUNDLE_FOLD,
        px,
        py,
        scale,
        -yaw * 0.6 + 1.6 * (1 - phase.approach) + 0.15 * Math.sin(t * 0.6),
        0.2 + 0.8 * (1 - phase.approach),
        pal,
        { stops: pal.chainB, fade: phase.visible },
      );
      if (phase.docked > 0) {
        const contacts: [number, Point, Point][] = [];
        for (const p of receptor.points) {
          for (const q of partner.points) {
            const d = Math.hypot(p[0] - q[0], p[1] - q[1]);
            if (d > scale * 2 && d < scale * 8) contacts.push([d, p, q]);
          }
        }
        contacts.sort((a, b) => a[0] - b[0]);
        ctx.setLineDash([2, 3]);
        for (const [, p, q] of contacts.slice(0, 5)) line(ctx, p[0], p[1], q[0], q[1], ink, 0.7 * phase.docked, 1.1);
        ctx.setLineDash([]);
      }
      if (phase.pulse > 0 && phase.pulse < 1) {
        ring(ctx, cx + side * 8.5 * scale, cy - 4 * scale, scale * (4 + 12 * phase.pulse), ink, 0.5 * (1 - phase.pulse), 1.2);
      }
    };

    pair(geometry.left + scale * 9, 0.6, t % CYCLE, -1);
    pair(geometry.right - scale * 9, -0.6, delayed(t, 0.6), 1);
  },
};
