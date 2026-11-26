import { useEffect, useRef, useState } from 'react';
import type { Palette, Scene } from './backgrounds/types';


const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const PHOTO_HALF_WIDTH = 140;
const PARALLAX = 12;

const LIGHT_PALETTE: Palette = {
  a0: [31, 122, 69],
  a1: [52, 179, 106],
  b0: [20, 83, 45],
  b1: [42, 157, 143],
  bg: [249, 250, 251],
  shadow: [10, 48, 30],
  ink: [15, 61, 36],
  hetero: [13, 148, 136],
  accent: [217, 119, 6],
  chainB: [
    [2, 132, 199],
    [79, 70, 229],
  ],
};
const DARK_PALETTE: Palette = {
  a0: [16, 185, 129],
  a1: [110, 231, 183],
  b0: [13, 148, 136],
  b1: [94, 234, 212],
  bg: [17, 24, 39],
  shadow: [4, 47, 46],
  ink: [236, 253, 245],
  hetero: [94, 234, 212],
  accent: [252, 211, 77],
  chainB: [
    [125, 211, 252],
    [165, 180, 252],
  ],
};

const currentPalette = () =>
  document.documentElement.classList.contains('dark') ? DARK_PALETTE : LIGHT_PALETTE;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof matchMedia === 'function' && matchMedia(REDUCED_MOTION_QUERY).matches,
  );

  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const media = matchMedia(REDUCED_MOTION_QUERY);
    const onChange = () => setReduced(media.matches);
    onChange();
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

interface FocusBackgroundProps {
  scene: Scene;
  className?: string;
}

export default function FocusBackground({ scene, className }: FocusBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    scene.onShow?.();
    let palette = currentPalette();
    let raf = 0;
    let t = reduced ? scene.still : 0;
    let last = performance.now();
    let running = true;
    let visible = true;
    let inView = true;
    let failed = false;
    const pointer = { x: 0, y: 0 };

    let cssWidth = 1;
    let cssHeight = 1;

    const draw = () => {
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      if (failed) return;
      const dead = Math.min(PHOTO_HALF_WIDTH, cssWidth * 0.2);
      ctx.save();
      ctx.translate(pointer.x * PARALLAX, pointer.y * PARALLAX);
      try {
        const paint = reduced ? (scene.drawStill ?? scene.draw) : scene.draw;
        paint(ctx, cssWidth, cssHeight, t, palette, dead);
      } catch (error) {
        failed = true;
        console.error('Background scene failed to draw', error);
      }
      ctx.restore();
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssWidth = Math.max(1, canvas.clientWidth);
      cssHeight = Math.max(1, canvas.clientHeight);
      canvas.width = Math.max(1, Math.round(cssWidth * dpr));
      canvas.height = Math.max(1, Math.round(cssHeight * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw();
    };

    const frame = (now: number) => {
      if (!running) return;
      t += Math.max(0, Math.min((now - last) / 1000, 0.1));
      last = now;
      draw();
      if (visible && inView) raf = requestAnimationFrame(frame);
      else running = false;
    };

    const restart = () => {
      if (running || reduced) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      if (inView) restart();
    });
    io.observe(canvas);

    const onVisibility = () => {
      visible = !document.hidden;
      if (visible) restart();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const clampUnit = (value: number) => Math.max(-1, Math.min(1, value));
      pointer.x = clampUnit(((event.clientX - rect.left) / rect.width - 0.5) * 2);
      pointer.y = clampUnit(((event.clientY - rect.top) / rect.height - 0.5) * 2);
    };
    if (!reduced) window.addEventListener('pointermove', onPointer);

    const themeObserver = new MutationObserver(() => {
      palette = currentPalette();
      if (reduced) draw();
    });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    if (reduced) {
      draw();
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reduced, scene]);

  return <canvas ref={canvasRef} className={className} aria-hidden />;
}
