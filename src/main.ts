import "@fontsource/barlow/400.css";
import "@fontsource/barlow/500.css";
import "@fontsource/barlow/600.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./style.css";
import { buildScale, PRESETS, type ScaleParams, type Swatch, toCssBlock } from "./scale.ts";

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
const gradientEl = $("#gradient");
const inspectorEl = $("#inspector");
const cssEl = $("#css code");
const copyBtn = $<HTMLButtonElement>("#copy");
const nameInput = $<HTMLInputElement>("#name");

type SliderKey = "anchorHue" | "solarHue" | "shadowHue" | "peakChroma" | "glimmer";
const SLIDERS: SliderKey[] = ["anchorHue", "solarHue", "shadowHue", "peakChroma", "glimmer"];

function formatValue(key: SliderKey, value: number): string {
  if (key === "peakChroma") return value.toFixed(3);
  if (key === "glimmer") return `${value.toFixed(2)}×`;
  return `${Math.round(value)}°`;
}

function syncControls(): void {
  nameInput.value = state.name;
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
      btn.className = "preset";
      btn.textContent = preset.label;
      const mid = buildScale(preset).find((s) => s.step === 50);
      if (mid) btn.style.setProperty("--dot", mid.css);
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
    <div class="chip" style="background:${swatch.css}"></div>
    <div class="inspector-meta">
      <code class="token">${swatch.token}</code>
      <code class="value">oklch(${swatch.l}% ${swatch.c} ${swatch.h})</code>
    </div>`;
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
      const step = document.createElement("span");
      step.textContent = String(swatch.step);
      step.className = contrast;
      const hue = document.createElement("span");
      hue.textContent = `${swatch.h}°`;
      hue.className = `hue ${contrast}`;
      btn.append(step, hue);
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
  const stops = swatches.map((s) => `${s.css} ${s.step}%`).join(", ");
  gradientEl.style.background = `linear-gradient(to right, ${stops})`;
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

nameInput.addEventListener("input", () => {
  state.name = nameInput.value;
  activePreset = null;
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

renderPresets();
syncControls();
render();
