/**
 * The route is the tool's interface.
 *
 * Every model parameter is readable from the query string and settable
 * through it, so a scale can be constructed, shared, and driven without
 * touching the UI — by a person with a link, or by an agent writing one.
 *
 * Two rules make it safe to hand a URL to something that isn't a browser
 * being careful:
 *
 * 1. Nothing here throws. Out-of-range numbers clamp to their control's
 *    range, unparseable ones fall back to the resolved preset, unknown
 *    keys are ignored. A malformed route still renders a valid scale.
 * 2. Values are snapped to their control's step, so the route and the
 *    slider always agree — `?anchorL=53` opens with the slider on 50 and
 *    the route rewritten to say 50, rather than the two disagreeing.
 */

import {
  type NumericParamKey,
  PARAM_BOUNDS,
  type ParamBounds,
  PRESETS,
  type Preset,
  type ScaleParams,
} from "./scale.ts";

/** Route key order. Stable, so a shared URL is diffable against another. */
const NUMERIC_ORDER: NumericParamKey[] = [
  "anchorHue",
  "anchorL",
  "peakChroma",
  "solarHue",
  "skyFactor",
  "glimmer",
];

/** Long enough for any real token family, short enough to not be a payload. */
const MAX_NAME = 64;

export interface RouteState {
  params: ScaleParams;
  /** Preset label, or null when the route carries explicit parameters. */
  preset: string | null;
}

/** `?preset=` value for a preset: "Deep Nordic Forest" → "deep-nordic-forest". */
export function presetSlug(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Accepts either the slugified label or the token family name ("forest"). */
function findPreset(token: string): Preset | undefined {
  const t = token.trim().toLowerCase();
  return PRESETS.find((p) => presetSlug(p.label) === t || p.name.toLowerCase() === t);
}

/**
 * Clamp into range, snap to step, and round: step 0.005 on binary floats
 * yields 0.13000000000000003, which must never reach a slider or a URL.
 */
function quantize(value: number, b: ParamBounds): number {
  const clamped = Math.min(b.max, Math.max(b.min, value));
  const snapped = b.min + Math.round((clamped - b.min) / b.step) * b.step;
  return Number(snapped.toFixed(4));
}

function parseBool(raw: string): boolean | null {
  const v = raw.trim().toLowerCase();
  if (v === "1" || v === "true" || v === "yes" || v === "on") return true;
  if (v === "0" || v === "false" || v === "no" || v === "off") return false;
  return null;
}

/** The preset a route resolves against before its own parameters apply. */
function baseParams(preset: Preset): ScaleParams {
  return {
    name: preset.name,
    anchorHue: preset.anchorHue,
    anchorL: preset.anchorL,
    solarHue: preset.solarHue,
    skyFactor: preset.skyFactor,
    subsurface: preset.subsurface,
    peakChroma: preset.peakChroma,
    glimmer: preset.glimmer,
  };
}

/**
 * Read a scale out of a query string. `?preset=` resolves first and any
 * explicit parameter overrides it, so preset-and-tweak is one URL.
 */
export function paramsFromRoute(search: string): RouteState {
  const q = new URLSearchParams(search);
  const named = q.get("preset");
  const resolved = named ? findPreset(named) : undefined;
  // An unresolvable preset name is ignored rather than fatal: fall back
  // to the default preset, same as an absent one.
  const base = resolved ?? PRESETS[0];
  const params = baseParams(base);

  // Only an override that actually took effect clears the preset chip.
  // Garbage leaves the preset intact, because nothing moved.
  let overridden = false;

  for (const key of NUMERIC_ORDER) {
    const raw = q.get(key);
    if (raw === null || raw.trim() === "") continue;
    const n = Number(raw);
    if (!Number.isFinite(n)) continue;
    params[key] = quantize(n, PARAM_BOUNDS[key]);
    overridden = true;
  }

  const sub = q.get("subsurface");
  if (sub !== null) {
    const v = parseBool(sub);
    if (v !== null) {
      params.subsurface = v;
      overridden = true;
    }
  }

  const name = q.get("name");
  if (name !== null) {
    params.name = name.trim().slice(0, MAX_NAME);
    overridden = true;
  }

  return { params, preset: overridden ? null : base.label };
}

/**
 * Write a scale into a query string — every parameter, defaults included.
 * A route that omits what matches a default doesn't tell you what the
 * scale is, and being readable is half the point of being in the route.
 */
export function routeFromParams(params: ScaleParams, preset: string | null): string {
  const q = new URLSearchParams();
  if (preset) q.set("preset", presetSlug(preset));
  q.set("name", params.name);
  q.set("anchorHue", String(quantize(params.anchorHue, PARAM_BOUNDS.anchorHue)));
  q.set("anchorL", String(quantize(params.anchorL, PARAM_BOUNDS.anchorL)));
  q.set("peakChroma", String(quantize(params.peakChroma, PARAM_BOUNDS.peakChroma)));
  q.set("solarHue", String(quantize(params.solarHue, PARAM_BOUNDS.solarHue)));
  q.set("skyFactor", String(quantize(params.skyFactor, PARAM_BOUNDS.skyFactor)));
  q.set("subsurface", params.subsurface ? "1" : "0");
  q.set("glimmer", String(quantize(params.glimmer, PARAM_BOUNDS.glimmer)));
  return q.toString();
}
