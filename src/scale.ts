/**
 * Starlit scale engine.
 *
 * Models the dual-light physics of natural materials: a pigment anchor in the
 * midtones, a warm solar pull toward yellow/amber in the highlights, and a
 * cool ambient drift in the shadows. Hue travels a single monotonic arc
 * (shortest-path interpolation) from shadow through anchor to solar light.
 */

export interface ScaleParams {
  /** Token family name, used as `--chroma-<name>-<step>`. */
  name: string;
  /** Local material anchor hue at L=50 (degrees). */
  anchorHue: number;
  /** Solar highlight hue at L=90 (degrees). */
  solarHue: number;
  /** Ambient shadow hue at L=10 (degrees). */
  shadowHue: number;
  /** Peak midtone chroma, 0.01–0.32. */
  peakChroma: number;
  /** Amplifies the chroma flare across L=80–95. */
  glimmer: number;
}

export interface Swatch {
  step: number;
  l: number;
  c: number;
  h: number;
  token: string;
  css: string;
}

export const STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100];

export interface Preset extends ScaleParams {
  label: string;
}

export const PRESETS: Preset[] = [
  {
    label: "Nordic Forest",
    name: "forest",
    shadowHue: 190,
    anchorHue: 145,
    solarHue: 105,
    peakChroma: 0.14,
    glimmer: 1.0,
  },
  {
    label: "Rowan Berry",
    name: "rowan",
    shadowHue: 355,
    anchorHue: 38,
    solarHue: 92,
    peakChroma: 0.19,
    glimmer: 1.15,
  },
  {
    label: "Hanami Sakura",
    name: "sakura",
    shadowHue: 345,
    anchorHue: 5,
    solarHue: 45,
    peakChroma: 0.11,
    glimmer: 0.9,
  },
  {
    label: "Mineral Slate",
    name: "slate",
    shadowHue: 240,
    anchorHue: 180,
    solarHue: 90,
    peakChroma: 0.05,
    glimmer: 0.7,
  },
];

/** Signed shortest angular distance from `from` to `to`, in (-180, 180]. */
function shortestDelta(from: number, to: number): number {
  return ((((to - from) % 360) + 540) % 360) - 180;
}

function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

function smoothstep(t: number): number {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}

/**
 * Hue along the arc. Shadow hue holds below L=10, eases to the anchor by
 * L=50, then eases on to the solar hue by L=90 and holds. Each segment uses
 * shortest-path interpolation, so the full path is one continuous arc.
 */
export function hueAt(l: number, p: ScaleParams): number {
  if (l <= 10) return normalizeHue(p.shadowHue);
  if (l <= 50) {
    const t = smoothstep((l - 10) / 40);
    return normalizeHue(p.shadowHue + shortestDelta(p.shadowHue, p.anchorHue) * t);
  }
  if (l <= 90) {
    const t = smoothstep((l - 50) / 40);
    return normalizeHue(p.anchorHue + shortestDelta(p.anchorHue, p.solarHue) * t);
  }
  return normalizeHue(p.solarHue);
}

/**
 * Chroma along the arc: a pigment bell peaking in the midtones plus a solar
 * glimmer flare centered near L=88, damped only at the extreme endpoints so
 * L=99 stays a warm tinted off-white and midtones never go grey.
 */
export function chromaAt(l: number, p: ScaleParams): number {
  const bell = p.peakChroma * Math.exp(-(((l - 48) / 34) ** 2));
  const flare = 0.11 * p.glimmer * Math.exp(-(((l - 88) / 7) ** 2));
  const lowDamp = 0.15 + 0.85 * Math.min(1, l / 10);
  const highDamp = Math.min(1, (100 - l) / 1.5);
  return Math.min(0.37, (bell + flare) * lowDamp * highDamp);
}

export function buildScale(p: ScaleParams): Swatch[] {
  const family =
    p.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-") || "starlit";
  return STEPS.map((step) => {
    const l = step;
    const c = Number(chromaAt(l, p).toFixed(4));
    const h = Number(hueAt(l, p).toFixed(1));
    const token = `--chroma-${family}-${step}`;
    return { step, l, c, h, token, css: `oklch(${l}% ${c} ${h})` };
  });
}

export function toCssBlock(swatches: Swatch[]): string {
  const lines = swatches.map((s) => `  ${s.token}: ${s.css};`);
  return `:root {\n${lines.join("\n")}\n}`;
}
