import { chromaAt, hueAtUnwrapped, type ScaleParams, type Swatch } from "./scale.ts";

/**
 * Waveform telemetry: three lanes over a shared lightness axis —
 * the hue arc h(L), the chroma curve C(L), and the color ribbon.
 * See specs/blocks/waveform-telemetry/spec.md.
 */

const W = 320;
const MX = 8;
const HUE = { label: 12, top: 20, height: 72 };
const CHROMA = { label: 112, top: 120, height: 56 };
const RIBBON = { top: 188, height: 24 };
const H = 220;
const CHROMA_MAX = 0.4;
const SAMPLE_STEP = 2;

const x = (l: number): number => MX + (l / 100) * (W - 2 * MX);

/** Map a click fraction of the svg's width back to an L value. */
export function fractionToL(fraction: number): number {
  const l = ((fraction * W - MX) / (W - 2 * MX)) * 100;
  return Math.min(100, Math.max(0, l));
}

export function renderTelemetry(
  container: HTMLElement,
  p: ScaleParams,
  swatches: Swatch[],
  selectedStep: number,
): void {
  const ls: number[] = [];
  for (let l = 0; l <= 100; l += SAMPLE_STEP) ls.push(l);

  const hues = ls.map((l) => hueAtUnwrapped(l, p));
  const chromas = ls.map((l) => chromaAt(l, p));
  const hueMin = Math.min(...hues) - 6;
  const hueMax = Math.max(...hues) + 6;
  const hueY = (h: number): number =>
    HUE.top + HUE.height - ((h - hueMin) / (hueMax - hueMin)) * HUE.height;
  const chromaY = (c: number): number =>
    CHROMA.top + CHROMA.height - (Math.min(c, CHROMA_MAX) / CHROMA_MAX) * CHROMA.height;

  const huePts = ls.map((l, i) => `${x(l).toFixed(1)},${hueY(hues[i]).toFixed(1)}`).join(" ");
  const chromaPts = ls.map((l, i) => `${x(l).toFixed(1)},${chromaY(chromas[i]).toFixed(1)}`);
  const chromaBottom = CHROMA.top + CHROMA.height;
  const chromaArea = `M ${x(0).toFixed(1)},${chromaBottom} L ${chromaPts.join(" L ")} L ${x(100).toFixed(1)},${chromaBottom} Z`;

  const ribbonStops = ls
    .map(
      (l, i) =>
        `<stop offset="${l}%" stop-color="oklch(${l}% ${chromas[i].toFixed(4)} ${hues[i].toFixed(1)})"/>`,
    )
    .join("");

  const dots = swatches
    .map((s) => {
      const cx = x(s.step).toFixed(1);
      const selected = s.step === selectedStep;
      const r = selected ? 4.5 : 3;
      const hy = hueY(hueAtUnwrapped(s.step, p)).toFixed(1);
      const cy = chromaY(s.c).toFixed(1);
      return `
        <circle cx="${cx}" cy="${hy}" r="${r}" fill="${s.css}" class="dot${selected ? " selected" : ""}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${s.css}" class="dot${selected ? " selected" : ""}"/>`;
    })
    .join("");

  const cx = x(selectedStep).toFixed(1);

  container.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Hue and chroma curves over lightness">
    <defs>
      <linearGradient id="ribbon-grad" x1="0" y1="0" x2="1" y2="0">${ribbonStops}</linearGradient>
    </defs>
    <text class="lane-label" x="${MX}" y="${HUE.label}">Hue</text>
    <text class="lane-label" x="${MX}" y="${CHROMA.label}">Chroma</text>
    <polyline class="hue-trace" points="${huePts}"/>
    <path class="chroma-area" d="${chromaArea}"/>
    <polyline class="chroma-trace" points="${chromaPts.join(" ")}"/>
    <rect x="${MX}" y="${RIBBON.top}" width="${W - 2 * MX}" height="${RIBBON.height}" rx="4" fill="url(#ribbon-grad)"/>
    <line class="cursor" x1="${cx}" y1="${HUE.top}" x2="${cx}" y2="${RIBBON.top + RIBBON.height}"/>
    ${dots}
  </svg>`;
}
