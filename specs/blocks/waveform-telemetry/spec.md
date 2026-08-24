# The waveform telemetry block

The waveform telemetry block visualizes the scale's signals as traces, like an
oscilloscope on a mixing desk. It answers "what is the engine doing?"
at a glance: how hue rotates, where chroma peaks and flares, and what
color each step lands on.

## Visual Structure

Title: WAVEFORM TELEMETRY

Three lanes stacked vertically, sharing one horizontal axis:
lightness L, 0 → 100 (this IS the light-intensity dimension —
it is the axis, not a trace).

1. **HUE lane** — the arc h(L) as a continuous trace. Hues are
   unwrapped before plotting so wrap-around arcs (355°→38°) draw as
   one smooth line with no vertical jump. Sampled densely (every 2 L),
   not just at the token steps.
2. **CHROMA lane** — C(L) as a filled trace: the pigment bell plus the
   solar glimmer flare. Fixed y-range 0–0.4 so presets are comparable.
3. **RIBBON lane** — the actual color at every L, a continuous strip.
   (Supersedes the standalone gradient bar under the swatch strip.)

Overlays, across all lanes:

- Dots on the hue and chroma traces at the 13 token steps, each dot
  filled with its own swatch color.
- A cursor (vertical hairline) at the selected step's L, spanning all
  three lanes — the playhead. Follows swatch selection.

Lane labels use the panel silkscreen treatment (HUE, CHROMA, RIBBON as
tiny uppercase labels); axis/readout numbers in mono.

## Functionality

- Redraws live while sliders move.
- Tapping/clicking a lane at some L selects the nearest token step
  (same effect as tapping that swatch).
- Rendered as inline SVG (crisp on any DPI, themeable with CSS vars,
  no canvas resize dances).

## Placement

A dashboard masonry panel, placed after the presets block.
