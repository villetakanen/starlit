import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./style.css";
import { version } from "../package.json";
import {
  buildScale,
  PRESETS,
  type ScaleParams,
  STEPS,
  type Swatch,
  shadowHueOf,
  toCssBlock,
} from "./scale.ts";
import { fractionToStepIndex, renderTelemetry } from "./telemetry.ts";

const state: ScaleParams = { ...PRESETS[0] };
let selectedStep = 50;
let activePreset: string | null = PRESETS[0].label;
const presetButtons = new Map<string, HTMLButtonElement>();

const $ = <T extends HTMLElement>(sel: string): T => {
  const el = document.querySelector<T>(sel);
  if (!el) throw new Error(`missing element: ${sel}`);
  return el;
};

const presetsEl = $("#presets");
const stripEl = $("#strip");
const telemetryEl = $("#telemetry");
const inspectorEl = $("#inspector");
const cssEl = $("#css code");
const copyBtn = $<HTMLButtonElement>("#copy");
const nameInput = $<HTMLInputElement>("#name");
const subsurfaceInput = $<HTMLInputElement>("#subsurface");

type SliderKey = "anchorHue" | "solarHue" | "skyFactor" | "peakChroma" | "glimmer";
const SLIDERS: SliderKey[] = ["anchorHue", "solarHue", "skyFactor", "peakChroma", "glimmer"];

function formatValue(key: SliderKey, value: number): string {
  if (key === "peakChroma") return value.toFixed(3);
  if (key === "glimmer") return `${value.toFixed(2)}×`;
  if (key === "skyFactor") return `${Math.round(value * 100)}%`;
  return `${Math.round(value)}°`;
}

function syncControls(): void {
  nameInput.value = state.name;
  subsurfaceInput.checked = state.subsurface;
  for (const key of SLIDERS) {
    $<HTMLInputElement>(`#${key}`).value = String(state[key]);
    $(`#${key}-out`).textContent = formatValue(key, state[key]);
  }
}

function renderPresets(): void {
  presetsEl.replaceChildren(
    ...PRESETS.map((preset) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-card";
      const mid = buildScale(preset).find((s) => s.step === 50);
      if (mid) btn.style.setProperty("--dot", mid.css);
      const name = document.createElement("span");
      name.className = "preset-name";
      name.textContent = preset.label;
      const info = document.createElement("span");
      info.className = "preset-info";
      info.textContent = `${Math.round(shadowHueOf(preset))}°→${preset.anchorHue}°→${preset.solarHue}° · L50`;
      btn.append(name, info);
      btn.addEventListener("click", () => {
        Object.assign(state, preset);
        activePreset = preset.label;
        syncControls();
        render();
      });
      presetButtons.set(preset.label, btn);
      return btn;
    }),
  );
}

function syncPresetChips(): void {
  for (const [label, btn] of presetButtons) {
    btn.setAttribute("aria-pressed", String(label === activePreset));
  }
}

function renderInspector(swatch: Swatch): void {
  inspectorEl.innerHTML = `
    <div class="monitor" style="background:${swatch.css}"></div>
    <code class="token">${swatch.token}</code>
    <dl class="readout-grid">
      <dt>Lightness</dt><dd>${swatch.l}%</dd>
      <dt>Chroma</dt><dd>${swatch.c}</dd>
      <dt>Hue</dt><dd>${swatch.h}°</dd>
    </dl>
    <code class="value">oklch(${swatch.l}% ${swatch.c} ${swatch.h})</code>`;
}

function render(): void {
  const swatches = buildScale(state);
  stripEl.replaceChildren(
    ...swatches.map((swatch) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "swatch";
      btn.style.background = swatch.css;
      btn.setAttribute("aria-label", `${swatch.token}: ${swatch.css}`);
      btn.setAttribute("aria-pressed", String(swatch.step === selectedStep));
      const contrast = swatch.l > 55 ? "on-light" : "on-dark";
      const hue = document.createElement("span");
      hue.textContent = `${Math.round(swatch.h)}°`;
      hue.className = `hue ${contrast}`;
      const step = document.createElement("span");
      step.textContent = String(swatch.step);
      step.className = `step ${contrast}`;
      btn.append(hue, step);
      btn.addEventListener("click", () => {
        selectedStep = swatch.step;
        render();
      });
      return btn;
    }),
  );
  const selected =
    swatches.find((s) => s.step === selectedStep) ?? swatches[Math.floor(swatches.length / 2)];
  renderInspector(selected);
  renderTelemetry(telemetryEl, state, swatches, selectedStep);
  cssEl.textContent = toCssBlock(swatches);
  syncPresetChips();
}

for (const key of SLIDERS) {
  $<HTMLInputElement>(`#${key}`).addEventListener("input", (e) => {
    state[key] = Number((e.target as HTMLInputElement).value);
    activePreset = null;
    $(`#${key}-out`).textContent = formatValue(key, state[key]);
    render();
  });
}

subsurfaceInput.addEventListener("change", () => {
  state.subsurface = subsurfaceInput.checked;
  activePreset = null;
  render();
});

nameInput.addEventListener("input", () => {
  state.name = nameInput.value;
  activePreset = null;
  render();
});

telemetryEl.addEventListener("click", (e) => {
  const rect = telemetryEl.getBoundingClientRect();
  selectedStep = STEPS[fractionToStepIndex((e.clientX - rect.left) / rect.width)];
  render();
});

stripEl.addEventListener("keydown", (e) => {
  const idx = STEPS.indexOf(selectedStep);
  let next = idx;
  if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = Math.max(0, idx - 1);
  else if (e.key === "ArrowDown" || e.key === "ArrowRight")
    next = Math.min(STEPS.length - 1, idx + 1);
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = STEPS.length - 1;
  else return;
  e.preventDefault();
  selectedStep = STEPS[next];
  render();
  (stripEl.children[next] as HTMLElement | undefined)?.focus();
});

telemetryEl.addEventListener("keydown", (e) => {
  const idx = STEPS.indexOf(selectedStep);
  let next = idx;
  if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = Math.max(0, idx - 1);
  else if (e.key === "ArrowRight" || e.key === "ArrowUp")
    next = Math.min(STEPS.length - 1, idx + 1);
  else if (e.key === "Home") next = 0;
  else if (e.key === "End") next = STEPS.length - 1;
  else return;
  e.preventDefault();
  selectedStep = STEPS[next];
  telemetryEl.setAttribute("aria-valuenow", String(selectedStep));
  render();
});

copyBtn.addEventListener("click", async () => {
  await navigator.clipboard.writeText(toCssBlock(buildScale(state)));
  copyBtn.textContent = "Copied ✓";
  copyBtn.classList.add("copied");
  setTimeout(() => {
    copyBtn.textContent = "Copy CSS";
    copyBtn.classList.remove("copied");
  }, 1200);
});

$("#version").textContent = `v${version}`;
renderPresets();
syncControls();
render();
