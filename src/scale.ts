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
  /**
   * Solar highlight hue at L=90, bound to the Planckian solar arc
   * (75°–105°): atmospheric extinction shifts sunlight from
   * neutral-warm toward amber-gold, never toward blue or magenta.
   */
  solarHue: number;
  /**
   * Rayleigh scattering factor, 0–1: how strongly occluded shadows
   * drift toward diffuse skylight (or, under subsurface extinction,
   * toward the pigment's absorption band). The shadow hue is derived,
   * not set directly — see shadowHueOf().
   */
  skyFactor: number;
  /**
   * Subsurface (Beer-Lambert) extinction: dense translucent organics
   * (foliage, berries, tissue) absorb short wavelengths internally, so
   * deep shadows shift toward the pigment's extinction band instead of
   * sky blue.
   */
  subsurface: boolean;
  /** Peak midtone chroma, 0.01–0.32. */
  peakChroma: number;
  /** Amplifies the chroma flare across L=80–95. */
  glimmer: number;
}

/** Diffuse skylight hue from Rayleigh scattering (I ∝ λ⁻⁴). */
export const SKY_HUE = 245;

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
    label: "Deep Nordic Forest",
    name: "forest",
    anchorHue: 145,
    solarHue: 105,
    skyFactor: 0.45,
    subsurface: false,
    peakChroma: 0.14,
    glimmer: 1.0,
  },
  {
    label: "Rowan Berry",
    name: "rowan",
    anchorHue: 38,
    solarHue: 92,
    skyFactor: 1.0,
    subsurface: true,
    peakChroma: 0.19,
    glimmer: 1.15,
  },
  {
    label: "Hanami Sakura",
    name: "sakura",
    anchorHue: 5,
    solarHue: 75,
    skyFactor: 1.0,
    subsurface: true,
    peakChroma: 0.11,
    glimmer: 0.9,
  },
  {
    label: "Citrus Fruit",
    name: "citrus",
    anchorHue: 60,
    solarHue: 95,
    skyFactor: 0.85,
    subsurface: true,
    peakChroma: 0.18,
    glimmer: 1.3,
  },
  {
    label: "Urban Asphalt",
    name: "asphalt",
    anchorHue: 240,
    solarHue: 85,
    skyFactor: 1.0,
    subsurface: false,
    peakChroma: 0.035,
    glimmer: 0.8,
  },
  {
    label: "Blueberry",
    name: "blueberry",
    anchorHue: 264,
    solarHue: 95,
    skyFactor: 0.9,
    subsurface: true,
    peakChroma: 0.16,
    glimmer: 0.85,
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
 * Derived shadow hue: the anchor pigment pulled toward the shadow's
 * illuminant by the Rayleigh factor. The illuminant is diffuse
 * skylight (245°), or — under subsurface extinction — the pigment's
 * absorption band (wine red 355° for warm pigments, a denser version
 * of the pigment itself otherwise).
 */
export function shadowHueOf(p: ScaleParams): number {
  const extinction = p.anchorHue > 30 && p.anchorHue < 120 ? 355 : p.anchorHue - 20;
  const target = p.subsurface ? extinction : SKY_HUE;
  return normalizeHue(p.anchorHue + shortestDelta(p.anchorHue, target) * p.skyFactor);
}

/**
 * Hue along the arc, unwrapped: monotonic degrees without the 0°/360°
 * seam, so the arc can be plotted as one continuous line. Shadow hue
 * holds below L=10, eases to the anchor by L=50, then eases on to the
 * solar hue by L=90 and holds. Each segment uses shortest-path deltas,
 * so the full path is one continuous arc.
 */
export function hueAtUnwrapped(l: number, p: ScaleParams): number {
  const shadowHue = shadowHueOf(p);
  const toAnchor = shortestDelta(shadowHue, p.anchorHue);
  const toSolar = shortestDelta(p.anchorHue, p.solarHue);
  const base = normalizeHue(shadowHue);
  if (l <= 10) return base;
  if (l <= 50) return base + toAnchor * smoothstep((l - 10) / 40);
  if (l <= 90) return base + toAnchor + toSolar * smoothstep((l - 50) / 40);
  return base + toAnchor + toSolar;
}

/** Hue along the arc, normalized to [0, 360). */
export function hueAt(l: number, p: ScaleParams): number {
  return normalizeHue(hueAtUnwrapped(l, p));
}

/**
 * Chroma along the arc: a pigment bell peaking in the midtones plus a solar
 * glimmer flare centered near L=88, damped only at the extreme endpoints so
 * L=99 stays a warm tinted off-white and midtones never go grey.
 */
export function chromaAt(l: number, p: ScaleParams): number {
  const bell = p.peakChroma * Math.exp(-(((l - 48) / 34) ** 2));
  const flare = 0.11 * p.glimmer * Math.exp(-(((l - 88) / 7) ** 2));
  return Math.min(0.37, (bell + flare) * chromaDamp(l));
}

/**
 * Chroma of the un-sunlit pigment: the bell alone, no solar glimmer
 * flare. Paired with the anchor hue this is the "true colour" baseline
 * that the sunlight effect is measured against.
 */
export function chromaBaseAt(l: number, p: ScaleParams): number {
  const bell = p.peakChroma * Math.exp(-(((l - 48) / 34) ** 2));
  return Math.min(0.37, bell * chromaDamp(l));
}

function chromaDamp(l: number): number {
  const lowDamp = 0.15 + 0.85 * Math.min(1, l / 10);
  const highDamp = Math.min(1, (100 - l) / 1.5);
  return lowDamp * highDamp;
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
