import { type ScaleParams, STEPS, type Swatch } from "./scale.ts";

/**
 * Waveform telemetry — being rebuilt element by element (divide et
 * impera). Currently in place: the scope screen (dark background with
 * a dot grid) and the bottom axis step numbers, equidistant.
 * See specs/blocks/waveform-telemetry/spec.md.
 */

const W = 320;
const MX = 14;
const SCREEN = { top: 0, height: 152 };
const AXIS = { label: 168 };
const H = 176;

const xOfIndex = (i: number): number => MX + (i / (STEPS.length - 1)) * (W - 2 * MX);

/** Map a click fraction of the svg's width to the nearest step index. */
export function fractionToStepIndex(fraction: number): number {
  const i = Math.round(((fraction * W - MX) / (W - 2 * MX)) * (STEPS.length - 1));
  return Math.min(STEPS.length - 1, Math.max(0, i));
}

export function renderTelemetry(
  container: HTMLElement,
  _p: ScaleParams,
  swatches: Swatch[],
  selectedStep: number,
): void {
  const grid = STEPS.map((_, i) => {
    const cx = xOfIndex(i).toFixed(1);
    return `<line class="grid-line" x1="${cx}" y1="${SCREEN.top + 10}" x2="${cx}" y2="${SCREEN.top + SCREEN.height - 10}"/>`;
  }).join("");

  const axis = swatches
    .map((s, i) => {
      const selected = s.step === selectedStep;
      return `
        <text class="axis-label${selected ? " selected" : ""}" x="${xOfIndex(i).toFixed(1)}" y="${AXIS.label}" text-anchor="middle">${s.step}</text>`;
    })
    .join("");

  container.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Waveform telemetry">
    <rect class="screen" x="0" y="${SCREEN.top}" width="${W}" height="${SCREEN.height}" rx="8"/>
    ${grid}
    ${axis}
  </svg>`;
}
