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

## 2. Clipboard fallback for insecure origins

- [ ] **Why:** `navigator.clipboard` is undefined on plain-http LAN
      origins — exactly how you demo on a real phone (`vite --host`).
- **Change:** in `main.ts`, fall back to a hidden textarea +
  `document.execCommand("copy")` when `navigator.clipboard` is absent or
  `writeText` rejects.
- **Test:** `npm run dev -- --host`, open via LAN IP on a phone or with
  `--unsafely-treat-insecure-origin-as-secure` disabled; Copy CSS still
  puts the block on the clipboard and shows "Copied ✓".

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

## 6. Hue-arc plot (depends on 1)

- [ ] **Why:** makes the monotonic arc — the thing the tool sells —
      visible and debuggable.
- **Change:** inline SVG polyline of h (y) over L (x) sampled every 2 L
  units, plus dots at the 13 token steps colored by their own swatch.
  Unwrap hues around the anchor before plotting so wrap-around scales
  (Rowan 355°→38°) draw one continuous line, then label the y-axis with
  normalized degrees.
- **Test:** Rowan Berry plots a single smooth curve with no vertical jump
  at the 0° crossing; the selected swatch's dot is emphasized.

## 7. Movable pigment anchor — engine (depends on 1)

- [ ] **Why:** real materials don't all anchor at L=50 (citrus ~70,
      deep berry ~40); currently hard-coded.
- **Change:** add `anchorL` (30–70, default 50) to `ScaleParams`; `hueAt`
  segments become 10→anchorL and anchorL→90; `chromaAt` bell centers on
  `anchorL`. Extend presets with explicit `anchorL: 50`.
- **Test:** new unit tests: `hueAt(anchorL) === anchorHue` and chroma
  peaks at the step nearest `anchorL` for anchorL ∈ {30, 50, 70}; all
  task-1 invariants still pass.

## 8. Movable pigment anchor — UI (depends on 7)

- [ ] **Why:** expose the engine capability.
- **Change:** segmented control (30/40/50/60/70) in the controls card;
  wire to state and `syncControls`.
- **Test:** selecting 70 visibly moves peak saturation up the strip; the
  inspector at step 70 shows the anchor hue exactly.

## 9. Anchor badge in strip (depends on 7)

- [ ] **Why:** shows where the true pigment lives in the scale.
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

## 13. Keyboard navigation for the swatch strip

- [ ] **Why:** swatches are buttons (tabbable) but 13 tab stops is
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

## Explicitly not doing (from Gemini prototype)

- Lagrange polynomial hue interpolation — overshoots, breaks monotonicity.
- Rayleigh-% / subsurface-toggle indirection — the direct shadow-hue
  slider stays.
- Solar hue clamped to 75–115° — full range stays.
- Tailwind CDN, Google Fonts, sub-11px type, global `user-select: none`.
