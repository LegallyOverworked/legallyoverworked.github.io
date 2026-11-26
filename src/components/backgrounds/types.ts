export type Rgb = [number, number, number];

export interface Palette {
  a0: Rgb;
  a1: Rgb;
  b0: Rgb;
  b1: Rgb;
  bg: Rgb;
  shadow: Rgb;
  ink: Rgb;
  hetero: Rgb;
  accent: Rgb;
  chainB: [Rgb, Rgb];
}

export type SceneDraw = (
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  pal: Palette,
  dead: number,
) => void;

export interface Scene {
  draw: SceneDraw;
  still: number;
  drawStill?: SceneDraw;
  onShow?: () => void;
}
