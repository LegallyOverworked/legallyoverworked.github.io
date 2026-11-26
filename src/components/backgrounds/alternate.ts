import type { Scene } from './types';

function remember(key: string, index: number): boolean {
  try {
    window.localStorage.setItem(`focus-background:${key}`, String(index));
    return true;
  } catch {
    return false;
  }
}

function startingScene(key: string, count: number): { index: number; pinned: boolean } {
  const pin = Number(new URLSearchParams(window.location.search).get(key));
  if (Number.isInteger(pin) && pin >= 1 && pin <= count) return { index: pin - 1, pinned: true };
  const storageKey = `focus-background:${key}`;
  let last = -1;
  try {
    const stored = window.localStorage.getItem(storageKey);
    if (stored !== null) last = Number(stored);
  } catch {
    last = -1;
  }
  let index = Math.floor(Math.random() * count);
  if (count > 1 && index === last) index = (index + 1 + Math.floor(Math.random() * (count - 1))) % count;
  remember(key, index);
  return { index, pinned: false };
}

export function alternate(key: string, scenes: Scene[]): Scene {
  const start = startingScene(key, scenes.length);
  let index = start.index;
  let shownAt = -1;
  return {
    still: scenes[0].still,
    draw(ctx, w, h, t, pal, dead) {
      scenes[index].draw(ctx, w, h, t, pal, dead);
    },
    drawStill(ctx, w, h, _t, pal, dead) {
      const scene = scenes[index];
      scene.draw(ctx, w, h, scene.still, pal, dead);
    },
    onShow() {
      const now = performance.now();
      if (shownAt >= 0 && now - shownAt < 200) return;
      if (shownAt >= 0 && !start.pinned) {
        index = (index + 1) % scenes.length;
        remember(key, index);
      }
      shownAt = now;
    },
  };
}
