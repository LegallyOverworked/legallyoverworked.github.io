import { clamp, dot, ease, flanks, hash, line, rgbStr, rng, roundedRect, strandA, strandB } from './draw';
import type { Palette, Scene } from './types';

interface Token {
  width: number;
  kind: number;
}

const INDENTS = [0, 1, 2, 2, 1, 1, 2, 1, 0];
const LINES: { indent: number; tokens: Token[] }[] = (() => {
  const r = rng(83);
  return INDENTS.map((indent) => ({
    indent,
    tokens: Array.from({ length: 2 + Math.floor(r() * 4) }, () => ({ width: 0.5 + r() * 1.6, kind: Math.floor(r() * 4) })),
  }));
})();

const CYCLE = 8;
const TYPING_TIME = 6.2;
const TESTS = 6;
const FAILING_TEST = 3;
const GAP = 0.25;

const tokenColour = (pal: Palette, kind: number, u: number) => (kind === 1 ? strandB(pal, u) : kind === 2 ? rgbStr(pal.accent) : strandA(pal, u));
const TOKEN_ALPHA = [0.75, 0.85, 0.9, 0.3];

export const codeEditor: Scene = {
  still: 5.5,
  draw(ctx, w, h, t, pal, dead) {
    const cy = h / 2;
    const tt = t % CYCLE;
    const fade = 1 - ease((tt - (CYCLE - 0.7)) / 0.7);
    const accent = rgbStr(pal.accent);
    const ink = rgbStr(pal.ink);
    const lineHeight = h * 0.066;
    const [left, right] = flanks(w, dead);
    const bar = (x: number, y: number, width: number, rgb: string, alpha: number) => {
      ctx.fillStyle = `rgba(${rgb},${alpha})`;
      roundedRect(ctx, x, y - 2.5, width, 5, 2.5);
      ctx.fill();
    };

    {
      const x0 = left[0] + 14;
      const unit = (left[1] - left[0] - 14) / 11;
      const top = cy - lineHeight * 4;
      const typed = clamp(tt / TYPING_TIME) * LINES.length;
      LINES.forEach((codeLine, i) => {
        const y = top + i * lineHeight;
        const visible = clamp(typed - i);
        dot(ctx, left[0] + 3, y, 1.4, strandA(pal, 0.1), 0.45 * fade);
        if (visible <= 0) return;
        const total = codeLine.tokens.reduce((sum, token) => sum + token.width + GAP, 0);
        let x = x0 + codeLine.indent * unit * 0.9;
        let used = 0;
        for (const token of codeLine.tokens) {
          const width = token.width * unit * 0.8;
          const written = clamp((visible * total - used) / (token.width + GAP));
          if (written <= 0) break;
          bar(x, y, Math.max(3, width * written), tokenColour(pal, token.kind, x / w), TOKEN_ALPHA[token.kind] * fade);
          if (written < 1) line(ctx, x + width * written + 3, y - 6, x + width * written + 3, y + 6, ink, 0.9 * fade, 1.5);
          x += width + unit * 0.2;
          used += token.width + GAP;
        }
      });
    }

    {
      const x0 = right[0] + 6;
      const span = right[1] - right[0] - 6;
      const top = cy - lineHeight * 3.5;
      for (let i = 0; i < TESTS; i += 1) {
        const started = 0.8 + i * 0.9;
        const shown = ease((tt - started) / 0.4);
        if (shown <= 0) continue;
        const y = top + i * lineHeight * 1.08;
        const running = clamp((tt - started) / 0.8) < 1;
        const failed = i === FAILING_TEST;
        const rgb = failed ? accent : strandA(pal, x0 / w);
        if (running) {
          ctx.strokeStyle = `rgba(${rgb},${0.9 * shown * fade})`;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.arc(x0 + 6, y, 4.5, t * 6, t * 6 + 4);
          ctx.stroke();
        } else if (failed) {
          line(ctx, x0 + 2.5, y - 3.5, x0 + 9.5, y + 3.5, accent, fade, 1.6);
          line(ctx, x0 + 9.5, y - 3.5, x0 + 2.5, y + 3.5, accent, fade, 1.6);
        } else {
          ctx.strokeStyle = `rgba(${ink},${0.9 * fade})`;
          ctx.lineWidth = 1.6;
          ctx.lineJoin = 'round';
          ctx.beginPath();
          ctx.moveTo(x0 + 2, y);
          ctx.lineTo(x0 + 5, y + 3.5);
          ctx.lineTo(x0 + 10.5, y - 3.5);
          ctx.stroke();
        }
        bar(x0 + 20, y, span * (0.2 + 0.25 * hash(i, 1, 1)), rgb, 0.6 * shown * fade);
        bar(x0 + 20 + span * 0.5, y, span * (0.1 + 0.12 * hash(i, 2, 1)), strandB(pal, 0.8), 0.35 * shown * fade);
      }
      const y = top + 6.7 * lineHeight * 1.08;
      const width = span * 0.86;
      const progress = clamp((tt - 0.8) / 5.4);
      const rgb = strandA(pal, 0.8);
      ctx.strokeStyle = `rgba(${rgb},${0.5 * fade})`;
      ctx.lineWidth = 1;
      roundedRect(ctx, x0, y - 4, width, 8, 4);
      ctx.stroke();
      ctx.fillStyle = `rgba(${rgb},${0.6 * fade})`;
      roundedRect(ctx, x0, y - 4, Math.max(8, width * progress), 8, 4);
      ctx.fill();
    }
  },
};
