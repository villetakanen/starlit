# Backlog

Atomic, independently testable tasks derived from
[ux-evaluation.md](ux-evaluation.md). Ordered so each lands on its own;
tasks marked with a dependency must follow it. One task = one commit.

## 1. Engine unit tests (foundation)

- [ ] **Why:** every later engine change needs a safety net proving the
      monotonic-arc and no-dead-zone guarantees.
- **Change:** add `vitest`; `src/scale.test.ts` asserting for all presets:
  hue deltas along L=10→90 never change sign (monotonic arc, computed via
  shortest-path deltas), chroma > 0.01 for all steps 10–95, C at L=99 is
  within 0.015–0.035, hue at 50/90/10 equals anchor/solar/shadow inputs.
- **Test:** `npm test` passes; temporarily breaking `hueAt` makes it fail.

## 3. ✅ Active preset indication

- [x] **Why:** no feedback for which preset is applied or that slider
      edits have diverged from it.
- **Change:** track applied preset in state; add `aria-pressed` + a
  selected style to the matching chip; clear it on any slider/name edit.
- **Test:** tap Rowan Berry → chip highlights; move any slider →
  highlight clears; tap it again → highlight returns.

## 4. ✅ Per-swatch hue readout

- [x] **Why:** the hue rotation — the product's core feature — is
      invisible without tapping every step.
- **Change:** render `h°` (and step) on each swatch row in the strip,
  right-aligned, using the existing on-light/on-dark contrast classes.
- **Test:** with Nordic Forest, strip shows 190° at step 10 descending to
  105° at step 90+; values update live while dragging the anchor slider.

## 5. ✅ Gradient continuity strip

- [x] **Why:** instant visual smoke test for banding, flips, and grey
      dead zones.
- **Change:** a full-width bar under the swatch strip:
  `linear-gradient(to right, <css> <step>%, …)` built from the 13 swatches.
- **Test:** bar renders with no visible band edges or grey gap in the
  midtones for all four presets.

## 6. ✅ Hue-arc plot (depends on 1)

> Superseded and delivered by the waveform telemetry block
> (specs/blocks/waveform-telemetry/spec.md): three lanes — unwrapped
> hue trace, chroma curve, color ribbon — with step dots, a selection
> cursor, and click-to-select. The gradient strip from task 5 was
> absorbed into the ribbon lane. Note: landed without the task-1 test
> safety net; engine tests remain open.

- [x] **Why:** makes the monotonic arc — the thing the tool sells —
      visible and debuggable.
- **Change:** inline SVG polyline of h (y) over L (x) sampled every 2 L
  units, plus dots at the 13 token steps colored by their own swatch.
  Unwrap hues around the anchor before plotting so wrap-around scales
  (Rowan 355°→38°) draw one continuous line, then label the y-axis with
  normalized degrees.
- **Test:** Rowan Berry plots a single smooth curve with no vertical jump
  at the 0° crossing; the selected swatch's dot is emphasized.

## 7. ✅ Movable pigment anchor — engine (depends on 1)

- [x] **Why:** real materials don't all anchor at L=50 (citrus ~70,
      deep berry ~40); currently hard-coded.
- **Change:** add `anchorL` (30–70, default 50) to `ScaleParams`; `hueAt`
  segments become 10→anchorL and anchorL→90; `chromaAt` bell centers on
  `anchorL`. Extend presets with explicit `anchorL: 50`.
- **Test:** new unit tests: `hueAt(anchorL) === anchorHue` and chroma
  peaks at the step nearest `anchorL` for anchorL ∈ {30, 50, 70}; all
  task-1 invariants still pass.

## 8. ✅ Movable pigment anchor — UI (depends on 7)

- [x] **Why:** expose the engine capability.
- **Change:** segmented control (30/40/50/60/70) in the controls card;
  wire to state and `syncControls`.
- **Test:** selecting 70 visibly moves peak saturation up the strip; the
  inspector at step 70 shows the anchor hue exactly.

## 9. ✅ Anchor badge in strip (depends on 7)

- [x] **Why:** shows where the true pigment lives in the scale.
- **Change:** mark the swatch at `anchorL` with a small ● / "anchor"
  affix and an `aria-label` addition.
- **Test:** badge sits on step 50 by default and follows the anchor
  selector; exactly one badge is ever visible.

## 10. Applied-token contrast preview

- [ ] **Why:** a paint chip doesn't prove a token works as a UI color.
- **Change:** in the inspector, a preview row using the selected swatch
  as background with sample text in the scale's 10 or 95 step (whichever
  contrasts), plus the computed choice shown as a token name.
- **Test:** tapping step 20 shows light-on-dark preview; step 90 shows
  dark-on-light; text remains readable across all 13 steps of all presets.

## 11. ✅ Desktop layout ≥768px (mobile-first, not mobile-only)

- [x] **Why:** current single column caps at 480px — mobile-only shipped
      to desktop. Wider viewports should show tuning and results at once.
- **Change:** CSS-only `@media (min-width: 768px)`: two-pane grid — strip
  + arc plot + inspector left, controls + CSS output right; raise
  `max-width` to ~960px. No markup or JS changes; 390px layout must be
  byte-identical CSS-wise below the breakpoint.
- **Test:** at 390px nothing changes; at 1024px both panes visible with
  no vertical scroll needed to see strip and sliders together.

## 12. ✅ Hover affordances gated on pointer (depends on 11)

- [x] **Why:** hover styles on touch devices cause sticky-hover bugs;
      desktop currently has no hover feedback at all.
- **Change:** wrap hover styles (swatch brightness lift, preset border)
  in `@media (hover: hover) and (pointer: fine)`.
- **Test:** on desktop, hovering a swatch shows feedback; in devtools
  touch emulation, tapping leaves no stuck hover state.

## 13. ✅ Keyboard navigation for the swatch strip

> Landed in two parts: the arrow/Home/End handler came in with an earlier
> commit, the roving tabindex closing it out. Strip stays a fieldset of
> `aria-pressed` buttons rather than a listbox.

- [x] **Why:** swatches are buttons (tabbable) but 13 tab stops is
      hostile; arrow keys are the expected pattern.
- **Change:** roving tabindex on the strip — ArrowUp/ArrowDown (and
  Left/Right) move selection, Home/End jump to 0/100; strip container
  gets `role="listbox"` semantics or stays buttons with `aria-pressed`.
- **Test:** tab once into the strip, arrow to step 90, inspector follows;
  shift-tab leaves the strip in one step.

## 14. Shareable state in URL (stretch)

- [ ] **Why:** a generated scale you can't link to dies in the tab;
      neither version has this.
- **Change:** serialize `ScaleParams` to the URL query on change
  (debounced, `history.replaceState`); hydrate from it on load.
- **Test:** tune a custom scale, copy URL, open in a private window —
  identical scale, sliders, and CSS output.

## 15. ✅ Chroma joins the True colour panel

- [x] **Why:** `peakChroma` *is* the chroma of the true-colour swatch —
      the bell peaks at `anchorL`, where `chromaDamp` is 1, so
      `chromaBaseAt(anchorL)` returns it verbatim. Labelling it "Peak
      midtone chroma" and filing it among the lighting knobs (solar
      extinction, Rayleigh, glimmer) framed a material property as a
      light effect, and split the pigment triple across two panels.
- **Change:** move the slider into the True colour panel between Hue and
  Step, relabel to `Chroma`; keep the param name `peakChroma`. No JS
  change — `SLIDERS` wires by id.
- **Test:** True colour reads Hue / Chroma / Step; the slider still
  drives the strip and the telemetry chroma trace; tuning controls no
  longer mention chroma.

## 16. Anchor flare gap in the Chroma readout

> Depends on #15 (Chroma living in the True colour panel), which is what
> made the gap conspicuous.

- [ ] **Why:** `Chroma` is the pigment bell's peak, but the painted
      swatch is `bell + flare`. The glimmer flare is centred on L=88 with
      a 7-unit width, so at `anchorL` = 80 it still contributes
      `0.11 · glimmer · exp(-(8/7)²)` ≈ 0.030 per unit of glimmer — up to
      0.060 at glimmer 2×. The slider then under-reports the swatch it
      is named after by a third of its own range. At anchorL ≤ 70 the
      term is ~0.0001 and irrelevant, so this is a one-step problem, not
      a curve problem. The flare is physically correct — sunlight near
      L=88 does reach L=80 — so the fix is disclosure, not damping it.
- **Change:** in the True colour panel, when the anchor swatch's rendered
  chroma diverges from `peakChroma` by more than one slider step (0.005),
  append the delivered value to the `Chroma` output — `0.180 → 0.210` —
  in the same on-panel style as the other readouts. Reuse
  `anchorStepOf()` to find the swatch and read its `c` from the built
  scale; no engine change, no new state.
- **Test:** anchorL 80 + glimmer 2× shows the arrow and a value matching
  the inspector's Chroma meter for step 80; dropping glimmer to 0, or
  anchorL to 70, drops the arrow and leaves a bare `0.180`.

## 17. ✅ FX panel; token name moves to the copy box

- [x] **Why:** the tuning card is the only titleless panel in the app
      (`aria-label="Tuning controls"` and nothing on screen), and it mixes
      the four knobs that recolor the pigment with one control that isn't
      physics at all — the token family name, which belongs with the CSS
      output it names. Naming the group **FX** completes the signal chain
      the app already speaks: True colour is the source, FX is the
      treatment, Signal monitor is where you watch it land. Grouping is by
      effect on the scale, not by light source — sun, sky, and subsurface
      knobs stay together because they all answer "what does light do to
      this pigment across L".
- **Change:** wrap the tuning card in a `<section>` + `h2.panel-title`
  reading `FX`, matching the True colour pattern (`aria-labelledby`, not
  `aria-label`). Move the token family name field into the CSS tokens
  panel on its own row between `.output-head` and the `<pre>` — not
  inline in the header, which is already tight at 390px. Trim
  `Rayleigh sky scattering` to `Sky scattering`: it is the app's longest
  label and Rayleigh is the only scattering mechanism in the model.
  `Solar extinction` stays — it names the mechanism rather than the
  quantity, and that is the point of it.
- **Test:** three titled panels read TRUE COLOUR / FX / SIGNAL MONITOR;
  the FX card holds exactly Solar extinction, Sky scattering, Subsurface
  extinction, Solar glimmer; the name field sits above the CSS block and
  still renames every token live; no horizontal scroll at 390px.

## Explicitly not doing (from Gemini prototype)

- Lagrange polynomial hue interpolation — overshoots, breaks monotonicity.
- Tailwind CDN, Google Fonts, sub-11px type, global `user-select: none`.

**Reversed by Ville (2026-08-24):** the derived-light model was adopted
after all — the shadow hue is now computed from the anchor via a
Rayleigh sky-scattering factor (245° skylight) or subsurface
Beer-Lambert extinction, and the solar hue is bound to the Planckian
arc (75–105°). See Gemini's "Biophysical Color Architecture" notes;
implemented in scale.ts (shadowHueOf).
