# UX evaluation: Gemini prototype vs. Starlit

Reference: the "ChromaArc Studio" single-file prototype built at Gemini.
This note records what is worth adopting, what to reject, and why —
the backlog in [backlog.md](backlog.md) is derived from it.

## Worth adopting

1. **Hue-arc plot (L vs h).** The single best idea in the prototype. The
   whole point of the tool is the shape of the hue arc, and a plot makes
   the monotonic-arc guarantee *visible* instead of implied. Ours has no
   visualization of the arc at all.
2. **Movable pigment anchor.** Gemini lets the anchor lightness sit at
   20–80 instead of hard-coded L=50. Real materials need it: citrus peel
   anchors bright (~70), deep berries anchor dark (~40). Our engine
   hard-codes 50 in three places.
3. **Active preset indication.** Gemini highlights the selected preset;
   ours gives no feedback about which preset is active or whether you've
   drifted from it.
4. **Per-swatch hue readout.** Showing the derived h° on each swatch makes
   the hue rotation legible at a glance without tapping each step.
5. **Applied-token preview.** The "Aa Text" contrast preview shows the
   token doing its actual job (background + readable text) rather than
   only being a paint chip.
6. **Anchor marking in the strip.** A badge on the anchor swatch tells you
   where the "true pigment" lives in the scale.
7. **Clipboard fallback.** Gemini's `execCommand` path is ugly but works on
   plain-http origins (e.g. `--host` LAN testing on a phone), where our
   `navigator.clipboard` throws. Ironic for a mobile-first tool: the one
   place you'd demo on a real phone is where copy breaks.
8. **Gradient continuity strip.** A full-scale linear gradient is a cheap,
   instant smoke test for banding and dead zones.

## Reject — with reasons

1. **Lagrange 3-point hue interpolation.** Gemini fits one polynomial
   through (10, h_shadow), (anchor, h_anchor), (90, h_solar). Polynomials
   through 3 points **overshoot**: with anchor near an endpoint the curve
   swings past the target hue and back, violating the prototype's own
   monotonic-arc rule. Our piecewise shortest-path smoothstep is correct;
   keep it and *prove* it with tests instead.
2. **Physics cosplay.** "Rayleigh $I \propto \lambda^{-4}$", "Beer-Lambert
   Extinction", "Planckian", "Phys-Optics v3.1" — jargon as decoration.
   It replaces a direct control (shadow hue slider) with an indirect one
   (Rayleigh % + subsurface toggle that secretly picks 355° or h−20°).
   Direct manipulation beats a leaky metaphor.
3. **Restricted solar range (75°–115°).** Physically motivated but kills
   legitimate creative use (e.g. a moonlit scale pulling toward cyan).
   Keep full 0–360 with the warm band as default preset values.
4. **Tailwind CDN + Google Fonts.** Runtime CDN dependency, FOUC, no
   build-time purge. Our hand-rolled CSS is smaller than Tailwind's CDN
   shim alone.
5. **Type at 8–11px, global `select-none`.** Fails WCAG comfortably; you
   can't even select the CSS output to copy it manually.
6. **Full innerHTML re-render per input event** with inline `onclick`
   handlers — discards DOM state, defeats a11y tooling.
7. **Canvas plot ignores hue wrap.** Rowan (355°→38°) draws a line jumping
   across the whole plot at the 0° crossing. If we build the plot, unwrap
   hues first.

## Mobile-first, not mobile-only

Both versions currently fail the same way: a hard `max-width` (430px /
480px) centered in a void. That's *mobile-only shipped to desktop*.
Mobile-first means the 390px layout is the base and wider viewports
*earn* enhancements:

- **≥768px:** two-pane layout — scale (strip, arc plot, inspector) on one
  side, controls + CSS output on the other, so tuning and results are
  visible simultaneously without scrolling. This is the actual desktop
  use case: a designer tuning tokens next to their editor.
- **Pointer/hover media queries:** hover affordances only where
  `(hover: hover)`; keep 44px touch targets everywhere.
- **Keyboard:** arrow-key navigation across the swatch strip; sliders
  already get keyboard for free as native inputs.

## Verdict

Keep Starlit's engine (correct arc math, no dependencies, honest
controls). Adopt Gemini's *feedback* ideas — plot, previews, anchor
visibility, state indication — which is where the prototype genuinely
out-UXes us. Add the desktop layer that neither version has.
