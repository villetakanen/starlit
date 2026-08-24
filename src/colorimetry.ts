import type { Swatch } from "./scale.ts";

/**
 * sRGB colorimetry for the signal monitor: gamut checking, hex
 * fallback, and WCAG contrast. OKLab → LMS → linear sRGB per
 * Björn Ottosson's reference matrices.
 */

const RAD = Math.PI / 180;

function oklchToLinearSrgb(l: number, c: number, h: number): [number, number, number] {
  const a = c * Math.cos(h * RAD);
  const b = c * Math.sin(h * RAD);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
}

const inGamut = (rgb: number[]): boolean => rgb.every((v) => v >= -0.0001 && v <= 1.0001);

/**
 * Linear sRGB of the colour, chroma-reduced to the gamut boundary if
 * the raw value clips. Returns whether the raw value clipped.
 */
function gamutMapped(swatch: Swatch): { rgb: [number, number, number]; clipped: boolean } {
  const l = swatch.l / 100;
  let rgb = oklchToLinearSrgb(l, swatch.c, swatch.h);
  if (inGamut(rgb)) return { rgb, clipped: false };
  let lo = 0;
  let hi = swatch.c;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (inGamut(oklchToLinearSrgb(l, mid, swatch.h))) lo = mid;
    else hi = mid;
  }
  rgb = oklchToLinearSrgb(l, lo, swatch.h);
  return {
    rgb: rgb.map((v) => Math.min(1, Math.max(0, v))) as [number, number, number],
    clipped: true,
  };
}

const toGamma = (v: number): number =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;

/** Gamut-mapped sRGB hex plus whether the raw colour clips sRGB. */
export function srgbInfo(swatch: Swatch): { hex: string; clipped: boolean } {
  const { rgb, clipped } = gamutMapped(swatch);
  const hex = rgb
    .map((v) =>
      Math.round(toGamma(v) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
  return { hex: `#${hex.toUpperCase()}`, clipped };
}

/** WCAG 2.1 contrast ratio between two swatches (gamut-mapped). */
export function contrastRatio(a: Swatch, b: Swatch): number {
  const lum = (s: Swatch): number => {
    const [r, g, bl] = gamutMapped(s).rgb;
    return 0.2126 * r + 0.7152 * g + 0.0722 * bl;
  };
  const la = lum(a);
  const lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
