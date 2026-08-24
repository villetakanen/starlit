import { type ScaleParams, STEPS, type Swatch } from "./scale.ts";

/**
 * Waveform telemetry — being rebuilt element by element (divide et
 * impera). Currently in place: the scope screen (dark background with
 * a dot grid) and the bottom axis step numbers, equidistant.
 * See specs/blocks/waveform-telemetry/spec.md.
 */

const W = 320;
const MX = 14;
const AXIS = { chipTop: 0, chipWidth: 22, chipHeight: 8, label: 180 };
const SCREEN = { top: 14, height: 152 };
const H = 186;

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
  _p: ScaleParams,
  swatches: Swatch[],
  selectedStep: number,
): void {
  // The L ruler: a gridline every 2 units of lightness, projected onto
  // the equidistant step axis. Dense where a step gap spans many L
  // units (10→20), absent where it spans few (99→100).
  const gridY1 = SCREEN.top + 10;
  const gridY2 = SCREEN.top + SCREEN.height - 10;
  const gridLines: string[] = [];
  for (let l = 0; l <= 100; l += 2) {
    const gx = xOfL(l).toFixed(1);
    const major = l % 10 === 0 ? " major" : "";
    gridLines.push(
      `<line class="grid-l${major}" x1="${gx}" y1="${gridY1}" x2="${gx}" y2="${gridY2}"/>`,
    );
  }
  const grid = gridLines.join("");

  const selIdx = STEPS.indexOf(selectedStep);
  const sx = xOfIndex(selIdx < 0 ? 5 : selIdx).toFixed(1);
  const selected = `
    <line class="grid-l major" x1="${sx}" y1="${gridY1}" x2="${sx}" y2="${gridY2}"/>
    <circle class="led-halo" cx="${sx}" cy="${gridY2}" r="4.5"/>
    <circle class="led" cx="${sx}" cy="${gridY2}" r="2.25"/>`;

  const axis = swatches
    .map((s, i) => {
      const cx = xOfIndex(i);
      const isSelected = s.step === selectedStep;
      const chipText = s.l > 55 ? "on-light" : "on-dark";
      const chipTextY = AXIS.chipTop + AXIS.chipHeight / 2 + 2.2;
      return `
        <rect class="chip" x="${(cx - AXIS.chipWidth / 2).toFixed(1)}" y="${AXIS.chipTop}"
          width="${AXIS.chipWidth}" height="${AXIS.chipHeight}" rx="2" fill="${s.css}"/>
        <text class="chip-hue ${chipText}" x="${cx.toFixed(1)}" y="${chipTextY}" text-anchor="middle">${Math.round(s.h)}°</text>
        <text class="axis-label${isSelected ? " selected" : ""}" x="${cx.toFixed(1)}" y="${AXIS.label}" text-anchor="middle">${s.step}</text>`;
    })
    .join("");

  container.innerHTML = `
  <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Waveform telemetry">
    <rect class="screen" x="0" y="${SCREEN.top}" width="${W}" height="${SCREEN.height}" rx="8"/>
    ${grid}
    ${selected}
    ${axis}
  </svg>`;
}
