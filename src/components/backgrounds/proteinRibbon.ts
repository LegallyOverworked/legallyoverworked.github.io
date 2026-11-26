import { TAU, type Vec3, clamp, dot, ease, line, rgbStr, ring, rot } from './draw';
import type { Palette, Rgb, Scene } from './types';


export type Point = [number, number];

export type Element =
  | { type: 'H'; p: Vec3; q: Vec3; phase?: number; domain?: number }
  | { type: 'E'; p: Vec3; q: Vec3; flat: Vec3; domain?: number };

interface Residue {
  p: Vec3;
  n: Vec3;
  ss: 'H' | 'E' | 'L';
  k: number;
  len: number;
  element: number;
  domain: number;
}

export interface Sample {
  p: Vec3;
  n: Vec3;
  w: number;
  t: number;
  domain: number;
}

export interface Fold {
  samples: Sample[];
  site: Vec3;
  near: number[];
}

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: Vec3, s: number): Vec3 => [a[0] * s, a[1] * s, a[2] * s];
const length = (a: Vec3) => Math.hypot(a[0], a[1], a[2]);
const unit = (a: Vec3): Vec3 => mul(a, 1 / (length(a) || 1));
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const mixVec = (a: Vec3, b: Vec3, t: number): Vec3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

const HELIX_RISE = 1.5;
const HELIX_RADIUS = 2.3;
const HELIX_TURN = (100 * Math.PI) / 180;
const STRAND_RISE = 3.3;
const HALF_WIDTH = { H: 1.3, E: 1.7, L: 0.4 };
const ARROW_HALF_WIDTH = 2.9;
const SUBDIVISIONS = 5;

export function buildFold(elements: Element[], site: Vec3): Fold {
  const groups = elements.map((e, element): Residue[] => {
    const axis = sub(e.q, e.p);
    const len = length(axis);
    const dir = mul(axis, 1 / len);
    const domain = e.domain ?? 0;
    if (e.type === 'E') {
      const n = Math.round(len / STRAND_RISE) + 1;
      return Array.from({ length: n }, (_, k) => ({
        p: add(e.p, mul(dir, (k * len) / (n - 1))),
        n: e.flat,
        ss: 'E' as const,
        k,
        len: n,
        element,
        domain,
      }));
    }
    const n = Math.round(len / HELIX_RISE) + 1;
    let e1 = cross(dir, [0, 0, 1]);
    if (length(e1) < 0.1) e1 = cross(dir, [1, 0, 0]);
    e1 = unit(e1);
    const e2 = cross(dir, e1);
    return Array.from({ length: n }, (_, k) => {
      const angle = k * HELIX_TURN + (e.phase ?? 0);
      const around = add(mul(e1, HELIX_RADIUS * Math.cos(angle)), mul(e2, HELIX_RADIUS * Math.sin(angle)));
      return { p: add(add(e.p, mul(dir, (k * len) / (n - 1))), around), n: dir, ss: 'H' as const, k, len: n, element, domain };
    });
  });

  const residues: Residue[] = [];
  groups.forEach((group, gi) => {
    if (gi > 0) {
      const a = residues[residues.length - 1];
      const b = group[0];
      const middle = mixVec(a.p, b.p, 0.5);
      const gap = length(sub(b.p, a.p));
      const control = add(middle, mul(unit(middle), 3 + 0.35 * gap));
      const count = Math.max(2, Math.round((gap * 1.2) / 3.6) - 1);
      for (let j = 1; j <= count; j += 1) {
        const s = j / (count + 1);
        const p = add(add(mul(a.p, (1 - s) * (1 - s)), mul(control, 2 * s * (1 - s))), mul(b.p, s * s));
        residues.push({ p, n: s < 0.5 ? a.n : b.n, ss: 'L', k: 0, len: 0, element: -1, domain: a.domain + (b.domain - a.domain) * s });
      }
    }
    residues.push(...group);
  });

  const halfWidth = (r: Residue) => (r.ss === 'E' && r.k === r.len - 1 ? 0.3 : HALF_WIDTH[r.ss]);
  const catmullRom = (p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, f: number): Vec3 => {
    const f2 = f * f;
    const f3 = f2 * f;
    const at = (i: number) =>
      0.5 *
      (2 * p1[i] +
        (-p0[i] + p2[i]) * f +
        (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * f2 +
        (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * f3);
    return [at(0), at(1), at(2)];
  };

  const samples: Sample[] = [];
  const last = residues.length - 1;
  for (let i = 0; i < last; i += 1) {
    const a = residues[i];
    const b = residues[i + 1];
    const before = residues[Math.max(0, i - 1)].p;
    const after = residues[Math.min(last, i + 2)].p;
    for (let s = 0; s < SUBDIVISIONS; s += 1) {
      const f = s / SUBDIVISIONS;
      let w: number;
      if (a.ss === 'E' && b.ss === 'E' && a.element === b.element) {
        const u = a.k + f;
        const shoulder = a.len - 2.6;
        w = u < shoulder ? HALF_WIDTH.E : ARROW_HALF_WIDTH * (1 - (u - shoulder) / (a.len - 1 - shoulder));
      } else {
        w = halfWidth(a) + (halfWidth(b) - halfWidth(a)) * f;
      }
      samples.push({
        p: catmullRom(before, a.p, b.p, after, f),
        n: unit(mixVec(a.n, b.n, f)),
        w,
        t: (i + f) / last,
        domain: a.domain + (b.domain - a.domain) * f,
      });
    }
  }
  samples.push({ p: residues[last].p, n: residues[last].n, w: halfWidth(residues[last]), t: 1, domain: residues[last].domain });

  const near: number[] = [];
  samples.forEach((s, i) => {
    const d = length(sub(s.p, site));
    if (d < 9.5 && d > 3 && i % 3 === 0) near.push(i);
  });
  return { samples, site, near };
}

export interface FoldOptions {
  stops?: Rgb[];
  transform?: (sample: Sample, index: number) => { p: Vec3; n: Vec3; w: number };
  fade?: number;
}

export function drawFold(
  ctx: CanvasRenderingContext2D,
  fold: Fold,
  cx: number,
  cy: number,
  scale: number,
  yaw: number,
  pitch: number,
  pal: Palette,
  options: FoldOptions = {},
): { site: Point; near: Point[]; points: Point[] } {
  const stops = options.stops ?? [pal.b0, pal.a0, pal.a1, pal.b1];
  const fade = options.fade ?? 1;
  const n = fold.samples.length;
  const posed = options.transform ? fold.samples.map(options.transform) : fold.samples;
  const P = posed.map((s) => rot(s.p, yaw, pitch));
  const N = posed.map((s) => rot(s.n, yaw, pitch));
  const order: [number, number][] = [];
  for (let i = 0; i < n - 1; i += 1) order.push([(P[i][2] + P[i + 1][2]) / 2, i]);
  order.sort((a, b) => a[0] - b[0]);

  const paint = (chainT: number, shade: number, depth: number) => {
    const x = clamp(chainT) * (stops.length - 1.001);
    const si = Math.floor(x);
    const f = x - si;
    const fog = (0.6 + 0.4 * depth) * fade;
    const out = [0, 1, 2].map((c) => {
      const base = stops[si][c] + (stops[si + 1][c] - stops[si][c]) * f;
      const shaded = pal.shadow[c] + (base - pal.shadow[c]) * shade;
      return Math.round(pal.bg[c] + (shaded - pal.bg[c]) * fog);
    });
    return `rgb(${out[0]},${out[1]},${out[2]})`;
  };

  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const [z, i] of order) {
    const a = P[i];
    const b = P[i + 1];
    const sa = fold.samples[i];
    const widthA = posed[i].w;
    const widthB = posed[i + 1].w;
    const depth = clamp((z / 15 + 1) / 2);
    const ax = cx + a[0] * scale;
    const ay = cy - a[1] * scale;
    const bx = cx + b[0] * scale;
    const by = cy - b[1] * scale;
    if (Math.max(widthA, widthB) < 0.62) {
      ctx.strokeStyle = paint(sa.t, 0.85, depth);
      ctx.lineWidth = Math.max(1.6, 0.85 * scale);
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
      continue;
    }
    const na = N[i];
    const nb = N[i + 1];
    const face = cross(sub(b, a), na);
    const facing = face[2] / (length(face) || 1);
    const shade = (0.62 + 0.38 * Math.abs(facing)) * (facing < 0 ? 0.8 : 1);
    const wa = widthA * scale;
    const wb = widthB * scale;
    const fill = paint(sa.t, shade, depth);
    ctx.fillStyle = fill;
    ctx.strokeStyle = fill;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(ax + na[0] * wa, ay - na[1] * wa);
    ctx.lineTo(bx + nb[0] * wb, by - nb[1] * wb);
    ctx.lineTo(bx - nb[0] * wb, by + nb[1] * wb);
    ctx.lineTo(ax - na[0] * wa, ay + na[1] * wa);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = paint(sa.t, shade * 0.5, depth);
    ctx.lineWidth = 0.9;
    ctx.beginPath();
    ctx.moveTo(ax + na[0] * wa, ay - na[1] * wa);
    ctx.lineTo(bx + nb[0] * wb, by - nb[1] * wb);
    ctx.moveTo(ax - na[0] * wa, ay + na[1] * wa);
    ctx.lineTo(bx - nb[0] * wb, by + nb[1] * wb);
    ctx.stroke();
  }
  const site = rot(fold.site, yaw, pitch);
  const points: Point[] = [];
  for (let i = 0; i < n; i += 8) points.push([cx + P[i][0] * scale, cy - P[i][1] * scale]);
  return {
    site: [cx + site[0] * scale, cy - site[1] * scale],
    near: fold.near.map((i): Point => [cx + P[i][0] * scale, cy - P[i][1] * scale]),
    points,
  };
}

export interface Ligand {
  atoms: [number, number, number][];
  bonds: [number, number][];
}

export function makeLigand(atoms: [number, number, number][]): Ligand {
  const bonds: [number, number][] = [];
  for (let i = 0; i < atoms.length; i += 1) {
    for (let j = i + 1; j < atoms.length; j += 1) {
      const d = Math.hypot(atoms[i][0] - atoms[j][0], atoms[i][1] - atoms[j][1]);
      if (d > 0.9 && d < 1.1) bonds.push([i, j]);
    }
  }
  return { atoms, bonds };
}

export const hexagon = (cx: number, startAngle: number) =>
  Array.from({ length: 6 }, (_, i): [number, number, number] => [
    cx + Math.cos(startAngle + (i * TAU) / 6),
    Math.sin(startAngle + (i * TAU) / 6),
    0,
  ]);

export const RING_LIGAND = makeLigand([...hexagon(0, 0), [2, 0, 1], [-2, 0, 1], [-2.5, 0.866, 1]]);

export const FUSED_LIGAND = (() => {
  const atoms: [number, number, number][] = [];
  for (const p of [...hexagon(-0.866, Math.PI / 6), ...hexagon(0.866, Math.PI / 6)]) {
    if (!atoms.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.2)) atoms.push(p);
  }
  atoms.push([2.598, 1, 1], [-2.598, -1, 1]);
  return makeLigand(atoms);
})();

export function drawLigand(
  ctx: CanvasRenderingContext2D,
  ligand: Ligand,
  x: number,
  y: number,
  angle: number,
  bond: number,
  pal: Palette,
  alpha: number,
  near: Point[],
  docked: number,
) {
  if (alpha <= 0 || bond <= 0) return;
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const atoms = ligand.atoms.map((a) => ({
    x: x + (a[0] * ca - a[1] * sa) * bond,
    y: y + (a[0] * sa + a[1] * ca) * bond,
    hetero: a[2] === 1,
  }));
  const ink = rgbStr(pal.ink);
  const hetero = rgbStr(pal.hetero);
  const bg = rgbStr(pal.bg);
  const stick = Math.max(1.5, bond * 0.24);
  const ball = Math.max(2.3, bond * 0.36);
  const radius = (a: { hetero: boolean }) => (a.hetero ? ball * 1.2 : ball);

  ctx.globalAlpha = alpha;
  if (docked > 0) {
    ctx.setLineDash([2, 3]);
    for (const a of atoms) {
      if (!a.hetero) continue;
      let best: Point | null = null;
      let bestDistance = Infinity;
      for (const p of near) {
        const d = Math.hypot(p[0] - a.x, p[1] - a.y);
        if (d < bestDistance && d > bond * 0.8) {
          bestDistance = d;
          best = p;
        }
      }
      if (best && bestDistance < bond * 6) line(ctx, a.x, a.y, best[0], best[1], ink, 0.75 * docked, 1.1);
    }
    ctx.setLineDash([]);
  }
  ctx.lineCap = 'round';
  for (const [i, j] of ligand.bonds) line(ctx, atoms[i].x, atoms[i].y, atoms[j].x, atoms[j].y, bg, 1, stick + 3);
  for (const a of atoms) dot(ctx, a.x, a.y, radius(a) + 1.5, bg, 1);
  for (const [i, j] of ligand.bonds) line(ctx, atoms[i].x, atoms[i].y, atoms[j].x, atoms[j].y, ink, 1, stick);
  for (const a of atoms) dot(ctx, a.x, a.y, radius(a), a.hetero ? hetero : ink, 1);
  ctx.globalAlpha = 1;
}

export const strand = (x: number): Element => ({
  type: 'E',
  p: [x, -6.6, 0.02 * x * x - x * 0.12],
  q: [x, 6.6, 0.02 * x * x + x * 0.12],
  flat: [1, 0, 0],
});
const helixDown = (x: number, z: number, phase: number): Element => ({ type: 'H', p: [x, 7, z], q: [x, -7, z], phase });

export const ALPHA_BETA_FOLD = buildFold(
  [
    strand(-4.8),
    helixDown(-8, 9.5, 0.3),
    strand(-9.6),
    helixDown(-6, -9.5, 1.4),
    strand(0),
    helixDown(3.5, -9.5, 2.2),
    strand(4.8),
    helixDown(12.5, -7, 0.9),
    strand(9.6),
    helixDown(4, 9.5, 3.1),
  ],
  [0.5, 11, 1.5],
);

export const HELIX_BUNDLE_FOLD = buildFold(
  [
    { type: 'H', p: [-5, -9.5, 4.5], q: [-4, 9.5, 4.5], phase: 0.2 },
    { type: 'H', p: [5, 9.5, 4.5], q: [4, -9.5, 4.5], phase: 1.9 },
    { type: 'H', p: [5, -9.5, -4.5], q: [4, 9.5, -4.5], phase: 0.8 },
    { type: 'H', p: [-5, 9.5, -4.5], q: [-4, -9.5, -4.5], phase: 2.6 },
  ],
  [0, 3, 7.6],
);

export const CYCLE = 5;

export function dockingPhase(tt: number) {
  return {
    approach: ease(tt / 2.3),
    docked: clamp((tt - 2.3) / 0.3) * (1 - clamp((tt - 4.2) / 0.3)),
    release: ease((tt - 4.2) / 0.8),
    visible: clamp(tt / 0.4) * (1 - ease((tt - 4.2) / 0.8)),
    pulse: (tt - 2.3) / 0.9,
  };
}

export function flankGeometry(w: number, h: number, dead: number) {
  const flank = w / 2 - dead - w * 0.05;
  const left = (w * 0.05 + w / 2 - dead) / 2;
  return { scale: Math.min(h * 0.0172, (flank * 0.42) / 15), left, right: w - left };
}

export const proteinRibbon: Scene = {
  still: 3.2,
  draw(ctx, w, h, t, pal, dead) {
    const { scale, left, right } = flankGeometry(w, h, dead);
    if (scale <= 0.5) return;
    const cy = h / 2 + h * 0.07;
    const leftX = left + scale * 2;
    const rightX = right - scale * 2;
    const ink = rgbStr(pal.ink);

    const complex = (
      fold: Fold,
      ligand: Ligand,
      cx: number,
      centreY: number,
      s: number,
      yaw: number,
      pitch: number,
      phase: ReturnType<typeof dockingPhase>,
      dx: number,
      dy: number,
      spin: number,
    ) => {
      const drawn = drawFold(ctx, fold, cx, centreY, s, yaw, pitch, pal);
      const distance = s * (13 * (1 - phase.approach) + 10 * phase.release);
      const sideways = s * 5 * (1 - phase.approach) * (1 - phase.approach);
      const lx = drawn.site[0] + dx * distance + Math.sign(dx) * Math.abs(dy) * sideways;
      const ly = drawn.site[1] + dy * distance + Math.abs(dx) * sideways;
      if (phase.pulse > 0 && phase.pulse < 1) {
        ring(ctx, drawn.site[0], drawn.site[1], s * (3 + 9 * phase.pulse), ink, 0.5 * (1 - phase.pulse), 1.2);
      }
      const angle = spin + 2.4 * (1 - phase.approach) + 0.1 * Math.sin(t * 1.3);
      drawLigand(ctx, ligand, lx, ly, angle, 1.45 * s, pal, phase.visible, drawn.near, phase.docked);
    };

    complex(
      ALPHA_BETA_FOLD,
      RING_LIGAND,
      leftX,
      cy,
      scale,
      0.6 + 0.3 * Math.sin(t * 0.5),
      0.3 + 0.08 * Math.sin(t * 0.37),
      dockingPhase(t % CYCLE),
      -0.62,
      -0.78,
      0.2,
    );
    complex(
      HELIX_BUNDLE_FOLD,
      FUSED_LIGAND,
      rightX,
      cy - h * 0.03,
      scale * 1.12,
      -0.45 + 0.3 * Math.sin(t * 0.45 + 1.5),
      0.22 + 0.08 * Math.sin(t * 0.4),
      dockingPhase(t < 0.5 ? 0 : (t - 0.5) % CYCLE),
      0.62,
      -0.78,
      1.2,
    );
  },
};
