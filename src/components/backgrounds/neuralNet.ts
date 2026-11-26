import { clamp, dot, ease, hash, line, ring, rng, strandA, strandB } from './draw';
import type { Scene } from './types';

type Point = [number, number];
type Edge = [number, number, number];
type Skip = [number, number, number, number, number];

const COUNTS = [4, 6, 6, 5, 3, 5, 6, 4, 1];
const OUTPUT = COUNTS.length - 1;
const LOCAL_LAYERS = [0, 6];
const ATTENTION_LAYER = 6;
const SKIPS: Skip[] = [
  [1, 0, 3, 0, -1],
  [1, 5, 3, 4, 1],
  [5, 0, 7, 0, -1],
  [5, 4, 7, 3, 1],
];

const WAVE_PERIOD = 3.2;
const LAYER_TIME = 1;
const PRE_ROLL = 13.1;

const NET = (() => {
  const r = rng(11);
  const bias = COUNTS.map((n) => Array.from({ length: n }, () => Math.pow(r(), 2.2)));
  bias[OUTPUT][0] = 1;
  const edges: Edge[][] = [];
  for (let l = 0; l < OUTPUT; l += 1) {
    const n = COUNTS[l];
    const m = COUNTS[l + 1];
    const layer: Edge[] = [];
    for (let i = 0; i < n; i += 1) {
      for (let j = 0; j < m; j += 1) {
        const weight = r() * 2 - 1;
        if (LOCAL_LAYERS.includes(l)) {
          if (Math.abs(j - (i * (m - 1)) / (n - 1)) > 1.4) continue;
        } else if (m > 1 && n * m > 16 && Math.abs(weight) < 0.3) {
          continue;
        }
        layer.push([i, j, Math.abs(weight)]);
      }
    }
    edges.push(layer);
  }
  const strongest = edges.map((layer, l) =>
    Array.from({ length: COUNTS[l] }, (_, i) =>
      layer
        .filter((e) => e[0] === i)
        .sort((a, b) => b[2] - a[2])
        .slice(0, 2),
    ),
  );
  return { bias, edges, strongest };
})();

export const neuralNet: Scene = {
  still: 2,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const tt = t + PRE_ROLL;
    const gap = Math.min(h * 0.112, 44);
    const l0 = w * 0.05 + 40;
    const l1 = w / 2 - dead - w * 0.03;
    const r0 = w / 2 + dead + w * 0.03;
    const r1 = w * 0.95 - 46;
    const xs = [0, 1, 2, 3]
      .map((i) => l0 + ((l1 - l0) * i) / 3)
      .concat([w / 2], [0, 1, 2, 3].map((i) => r0 + ((r1 - r0) * i) / 3));
    const pos = (l: number, i: number): Point => [
      xs[l],
      cy + (i - (COUNTS[l] - 1) / 2) * gap + Math.sin(t * 0.5 + l * 1.7 + i * 2.3) * 2,
    ];
    const activation = (wave: number, l: number, i: number) =>
      0.12 + 0.88 * (0.78 * NET.bias[l][i] + 0.22 * hash(wave, l, i));
    const bezier = (a: Point, b: Point, c: Point, s: number): Point => [
      (1 - s) * (1 - s) * a[0] + 2 * s * (1 - s) * c[0] + s * s * b[0],
      (1 - s) * (1 - s) * a[1] + 2 * s * (1 - s) * c[1] + s * s * b[1],
    ];

    {
      const entered = Math.floor(tt / WAVE_PERIOD);
      const change = ease((tt - entered * WAVE_PERIOD) / 0.6);
      const rgb = strandA(pal, 0);
      ctx.font = '500 12px ui-monospace,SFMono-Regular,Menlo,monospace';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'right';
      for (let i = 0; i < COUNTS[0]; i += 1) {
        const p = pos(0, i);
        const shown = activation(entered - 1, 0, i) + (activation(entered, 0, i) - activation(entered - 1, 0, i)) * change;
        ctx.fillStyle = `rgba(${rgb},${0.55 + 0.4 * shown})`;
        ctx.fillText(shown.toFixed(2), p[0] - 11, p[1] + 0.5);
      }
      const top = pos(0, 0)[1] - gap * 0.45;
      const bottom = pos(0, COUNTS[0] - 1)[1] + gap * 0.45;
      const right = xs[0] - 7;
      const left = xs[0] - 43;
      ctx.strokeStyle = `rgba(${rgb},0.6)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left + 4, top);
      ctx.lineTo(left, top);
      ctx.lineTo(left, bottom);
      ctx.lineTo(left + 4, bottom);
      ctx.moveTo(right - 4, top);
      ctx.lineTo(right, top);
      ctx.lineTo(right, bottom);
      ctx.lineTo(right - 4, bottom);
      ctx.stroke();
    }

    for (let l = 0; l < OUTPUT; l += 1) {
      for (const e of NET.edges[l]) {
        const a = pos(l, e[0]);
        const b = pos(l + 1, e[1]);
        line(ctx, a[0], a[1], b[0], b[1], strandA(pal, a[0] / w), 0.04 + 0.13 * e[2] * e[2]);
      }
    }

    const skips = SKIPS.map((s) => {
      const a = pos(s[0], s[1]);
      const b = pos(s[2], s[3]);
      const edge = s[4] < 0 ? Math.min(a[1], b[1]) : Math.max(a[1], b[1]);
      const c: Point = [(a[0] + b[0]) / 2, edge + s[4] * h * 0.085];
      return { a, b, c, s };
    });
    ctx.setLineDash([3, 3]);
    for (const g of skips) {
      ctx.strokeStyle = `rgba(${strandB(pal, g.a[0] / w)},0.42)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(g.a[0], g.a[1]);
      ctx.quadraticCurveTo(g.c[0], g.c[1], g.b[0], g.b[1]);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    const latest = Math.floor(tt / WAVE_PERIOD);
    const glow = COUNTS.map((n) => new Array<number>(n).fill(0));
    const pulses: { a: Point; b: Point; c: Point | null; p: number; strength: number; alt: boolean }[] = [];
    for (let wave = latest; wave > latest - 5; wave -= 1) {
      const age = tt - wave * WAVE_PERIOD;
      for (let l = 0; l <= OUTPUT; l += 1) {
        const tau = age - l * LAYER_TIME;
        if (tau < 0) continue;
        for (let i = 0; i < COUNTS[l]; i += 1) {
          glow[l][i] = Math.max(glow[l][i], activation(wave, l, i) * Math.exp(-tau / 0.9));
        }
        if (l < OUTPUT && tau < LAYER_TIME) {
          for (let i = 0; i < COUNTS[l]; i += 1) {
            const strength = activation(wave, l, i);
            const a = pos(l, i);
            for (const e of NET.strongest[l][i]) {
              pulses.push({ a, b: pos(l + 1, e[1]), c: null, p: tau / LAYER_TIME, strength, alt: (i + e[1]) % 2 === 1 });
            }
          }
        }
        for (const g of skips) {
          if (g.s[0] === l && tau < 2 * LAYER_TIME) {
            pulses.push({ a: g.a, b: g.b, c: g.c, p: tau / (2 * LAYER_TIME), strength: activation(wave, l, g.s[1]), alt: true });
          }
        }
      }
    }

    for (let i = 0; i < COUNTS[ATTENTION_LAYER] - 2; i += 1) {
      const a = pos(ATTENTION_LAYER, i);
      const b = pos(ATTENTION_LAYER, i + 2);
      const lit = Math.max(glow[ATTENTION_LAYER][i], glow[ATTENTION_LAYER][i + 2]);
      ctx.strokeStyle = `rgba(${strandB(pal, a[0] / w)},${0.14 + 0.5 * lit})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.quadraticCurveTo(a[0] + 20, (a[1] + b[1]) / 2, b[0], b[1]);
      ctx.stroke();
    }

    for (const pulse of pulses) {
      const at = (s: number): Point =>
        pulse.c
          ? bezier(pulse.a, pulse.b, pulse.c, s)
          : [pulse.a[0] + (pulse.b[0] - pulse.a[0]) * s, pulse.a[1] + (pulse.b[1] - pulse.a[1]) * s];
      const tail = at(ease(pulse.p - 0.12));
      const head = at(ease(pulse.p));
      const color = pulse.alt ? strandB(pal, pulse.a[0] / w) : strandA(pal, pulse.a[0] / w);
      line(ctx, tail[0], tail[1], head[0], head[1], color, 0.15 + 0.55 * pulse.strength, 1.4);
      dot(ctx, head[0], head[1], 1.3 + 1.3 * pulse.strength, color, 0.2 + 0.75 * pulse.strength);
    }

    for (let l = 0; l <= OUTPUT; l += 1) {
      for (let i = 0; i < COUNTS[l]; i += 1) {
        const p = pos(l, i);
        const g = glow[l][i];
        const bias = NET.bias[l][i];
        const color = i % 2 ? strandB(pal, p[0] / w) : strandA(pal, p[0] / w);
        const r = 1.8 + 2.2 * bias + 1.8 * g;
        if (g > 0.25) {
          dot(ctx, p[0], p[1], r + 5, color, 0.13 * g);
          ring(ctx, p[0], p[1], r + 3 + 4 * (1 - g), color, 0.5 * g);
        }
        dot(ctx, p[0], p[1], r, color, clamp(0.28 + 0.3 * bias + 0.45 * g));
      }
    }
    for (const g of skips) ring(ctx, g.b[0], g.b[1], 8, strandB(pal, g.b[0] / w), 0.4);

    const arrivals = (tt - OUTPUT * LAYER_TIME) / WAVE_PERIOD;
    const wave = Math.floor(arrivals);
    const value = (k: number) => 0.62 + 0.37 * hash(k, 9, 9);
    const shown = value(wave - 1) + (value(wave) - value(wave - 1)) * ease(((arrivals - wave) * WAVE_PERIOD) / 0.6);
    const out = pos(OUTPUT, 0);
    ctx.font = '500 13px ui-monospace,SFMono-Regular,Menlo,monospace';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillStyle = `rgba(${strandA(pal, 1)},0.95)`;
    ctx.fillText(shown.toFixed(2), out[0] + 13, out[1] + 0.5);
  },
};
