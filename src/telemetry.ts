import { hueAtUnwrapped, type ScaleParams, STEPS, type Swatch } from "./scale.ts";

/**
 * Waveform telemetry: the applied light as traces over the 13 token
 * steps, drawn equidistantly — the steps are bespoke tokens, not a
 * linear lightness axis. See specs/blocks/waveform-telemetry/spec.md.
 */

const W = 320;
const MX = 14;
const PLOT = { top: 8, bottom: 156 };
const TRACE = { top: 36, bottom: 144 };
const AXIS = { label: 172, chip: 178, chipHeight: 4, chipWidth: 16 };
const H = 192;
const GRID_GAP = 16;

const x = (i: number): number => MX + (i / (STEPS.length - 1)) * (W - 2 * MX);

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
  const strengthY = (l: number): number => TRACE.bottom - (l / 100) * (TRACE.bottom - TRACE.top);

  const hues = STEPS.map((step) => hueAtUnwrapped(step, p));
  const hueMin = Math.min(...hues) - 6;
  const hueMax = Math.max(...hues) + 6;
  const hueY = (h: number): number =>
    TRACE.bottom - ((h - hueMin) / (hueMax - hueMin)) * (TRACE.bottom - TRACE.top);

  const strengthPts = STEPS.map((step, i) => `${x(i).toFixed(1)},${strengthY(step).toFixed(1)}`);
  const huePts = STEPS.map((_, i) => `${x(i).toFixed(1)},${hueY(hues[i]).toFixed(1)}`);

  const traceDots = STEPS.map(
    (step, i) => `
      <circle class="dot strength-dot" cx="${x(i).toFixed(1)}" cy="${strengthY(step).toFixed(1)}" r="2"/>
      <circle class="dot hue-dot" cx="${x(i).toFixed(1)}" cy="${hueY(hues[i]).toFixed(1)}" r="2"/>`,
  ).join("");

  const axis = swatches
    .map((s, i) => {
      const cx = x(i);
      const selected = s.step === selectedStep;
      return `
        <text class="axis-label" x="${cx.toFixed(1)}" y="${AXIS.label}" text-anchor="middle">${s.step}</text>
        <rect class="chip${selected ? " selected" : ""}" x="${(cx - AXIS.chipWidth / 2).toFixed(1)}"
          y="${AXIS.chip}" width="${AXIS.chipWidth}" height="${AXIS.chipHeight}" rx="1.5" fill="${s.css}"/>`;
    })
    .join("");

  const selIdx = STEPS.indexOf(selectedStep);
  const cx = x(selIdx < 0 ? 5 : selIdx).toFixed(1);

  container.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="img"
    aria-label="Applied light strength and wavelength over the token steps">
    <defs>
      <pattern id="scope-dots" width="${GRID_GAP}" height="${GRID_GAP}" patternUnits="userSpaceOnUse">
        <circle cx="${GRID_GAP / 2}" cy="${GRID_GAP / 2}" r="0.75" class="grid-dot"/>
      </pattern>
    </defs>
    <rect class="screen" x="0" y="0" width="${W}" height="${PLOT.bottom + 8}" rx="8"/>
    <rect x="0" y="0" width="${W}" height="${PLOT.bottom + 8}" rx="8" fill="url(#scope-dots)"/>
    <text class="lane-label" x="${MX}" y="${PLOT.top + 12}">Strength</text>
    <text class="lane-label wavelength" x="${MX}" y="${PLOT.top + 24}">Wavelength</text>
    <line class="cursor" x1="${cx}" y1="${PLOT.top}" x2="${cx}" y2="${AXIS.chip + AXIS.chipHeight}"/>
    <polyline class="strength-trace" points="${strengthPts.join(" ")}"/>
    <polyline class="hue-trace" points="${huePts.join(" ")}"/>
    ${traceDots}
    ${axis}
  </svg>`;
}
