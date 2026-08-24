import { chromaAt, hueAtUnwrapped, type ScaleParams, STEPS, type Swatch } from "./scale.ts";

/**
 * Waveform telemetry: the applied light as smooth traces on a dark
 * scope screen. The x axis is the 13 bespoke token steps, equidistant;
 * curves are sampled densely and mapped piecewise between the step
 * positions, so the scale's condensation at the ends stays visible.
 * See specs/blocks/waveform-telemetry/spec.md.
 */

const W = 320;
const MX = 14;
const PLOT = { top: 8, bottom: 148 };
const TRACE = { top: 40, bottom: 140 };
const RIBBON = { top: 156, height: 8 };
const AXIS = { label: 182, chip: 188, chipHeight: 4, chipWidth: 16 };
const H = 200;
const GRID_GAP = 16;
const CHROMA_MAX = 0.4;

const xOfIndex = (i: number): number => MX + (i / (STEPS.length - 1)) * (W - 2 * MX);

/** Map a lightness value onto the equidistant-step axis, piecewise. */
function xOfL(l: number): number {
  for (let i = 0; i < STEPS.length - 1; i++) {
    if (l <= STEPS[i + 1]) {
      const t = (l - STEPS[i]) / (STEPS[i + 1] - STEPS[i]);
      return xOfIndex(i) + t * (xOfIndex(i + 1) - xOfIndex(i));
    }
  }
  return xOfIndex(STEPS.length - 1);
}

/** Map a click fraction of the svg's width to the nearest step index. */
export function fractionToStepIndex(fraction: number): number {
  const i = Math.round(((fraction * W - MX) / (W - 2 * MX)) * (STEPS.length - 1));
  return Math.min(STEPS.length - 1, Math.max(0, i));
}

export function renderTelemetry(
  container: HTMLElement,
  p: ScaleParams,
  swatches: Swatch[],
  selectedStep: number,
): void {
  const ls: number[] = [];
  for (let l = 0; l <= 100; l += 1) ls.push(l);

  const hues = ls.map((l) => hueAtUnwrapped(l, p));
  const hueMin = Math.min(...hues) - 6;
  const hueMax = Math.max(...hues) + 6;

  const traceH = TRACE.bottom - TRACE.top;
  const strengthY = (l: number): number => TRACE.bottom - (l / 100) * traceH;
  const hueY = (h: number): number => TRACE.bottom - ((h - hueMin) / (hueMax - hueMin)) * traceH;
  const chromaY = (c: number): number =>
    TRACE.bottom - (Math.min(c, CHROMA_MAX) / CHROMA_MAX) * traceH;

  const pts = (y: (l: number, i: number) => number): string =>
    ls.map((l, i) => `${xOfL(l).toFixed(1)},${y(l, i).toFixed(1)}`).join(" ");

  const strengthPts = pts((l) => strengthY(l));
  const huePts = pts((_, i) => hueY(hues[i]));
  const chromaPts = pts((l) => chromaY(chromaAt(l, p)));
  const chromaArea = `M ${MX},${TRACE.bottom} L ${chromaPts.split(" ").join(" L ")} L ${W - MX},${TRACE.bottom} Z`;

  const ribbonStops = ls
    .filter((l) => l % 2 === 0)
    .map((l) => {
      const off = (((xOfL(l) - MX) / (W - 2 * MX)) * 100).toFixed(1);
      return `<stop offset="${off}%" stop-color="oklch(${l}% ${chromaAt(l, p).toFixed(4)} ${hueAtUnwrapped(l, p).toFixed(1)})"/>`;
    })
    .join("");

  const stepDots = swatches
    .map((s, i) => {
      const cx = xOfIndex(i).toFixed(1);
      return `
        <circle class="dot strength-dot" cx="${cx}" cy="${strengthY(s.step).toFixed(1)}" r="2"/>
        <circle class="dot hue-dot" cx="${cx}" cy="${hueY(hueAtUnwrapped(s.step, p)).toFixed(1)}" r="2"/>`;
    })
    .join("");

  const axis = swatches
    .map((s, i) => {
      const cx = xOfIndex(i);
      const selected = s.step === selectedStep;
      return `
        <text class="axis-label" x="${cx.toFixed(1)}" y="${AXIS.label}" text-anchor="middle">${s.step}</text>
        <rect class="chip${selected ? " selected" : ""}" x="${(cx - AXIS.chipWidth / 2).toFixed(1)}"
          y="${AXIS.chip}" width="${AXIS.chipWidth}" height="${AXIS.chipHeight}" rx="1.5" fill="${s.css}"/>`;
    })
    .join("");

  const selIdx = STEPS.indexOf(selectedStep);
  const cx = xOfIndex(selIdx < 0 ? 5 : selIdx).toFixed(1);

  container.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Applied light strength, wavelength, and chroma over the token steps">
    <defs>
      <pattern id="scope-dots" width="${GRID_GAP}" height="${GRID_GAP}" patternUnits="userSpaceOnUse">
        <circle cx="${GRID_GAP / 2}" cy="${GRID_GAP / 2}" r="0.75" class="grid-dot"/>
      </pattern>
      <linearGradient id="ribbon-grad" x1="0" y1="0" x2="1" y2="0">${ribbonStops}</linearGradient>
    </defs>
    <rect class="screen" x="0" y="0" width="${W}" height="${PLOT.bottom + 8}" rx="8"/>
    <rect x="0" y="0" width="${W}" height="${PLOT.bottom + 8}" rx="8" fill="url(#scope-dots)"/>
    <text class="lane-label" x="${MX}" y="${PLOT.top + 10}">Strength</text>
    <text class="lane-label wavelength" x="${MX}" y="${PLOT.top + 20}">Wavelength</text>
    <text class="lane-label chroma" x="${MX}" y="${PLOT.top + 30}">Chroma</text>
    <line class="cursor" x1="${cx}" y1="${PLOT.top}" x2="${cx}" y2="${AXIS.chip + AXIS.chipHeight}"/>
    <path class="chroma-area" d="${chromaArea}"/>
    <polyline class="chroma-trace" points="${chromaPts}"/>
    <polyline class="strength-trace" points="${strengthPts}"/>
    <polyline class="hue-trace" points="${huePts}"/>
    ${stepDots}
    <rect x="${MX}" y="${RIBBON.top}" width="${W - 2 * MX}" height="${RIBBON.height}" rx="3" fill="url(#ribbon-grad)"/>
    ${axis}
  </svg>`;
}
