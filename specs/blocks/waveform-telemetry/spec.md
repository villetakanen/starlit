# The waveform telemetry block

The waveform telemetry block visualizes the light the engine applies to
the scale, like an oscilloscope on a mixing desk. It answers "what is
the light doing at each step?" at a glance.

## Visual Structure

Title: WAVEFORM TELEMETRY

One dark scope screen: a panel-recessed area (background level 0,
darker than the card) with a dot grid to give the traces a sense of
scale.

**X axis: the 13 token steps, equidistant.** The steps are bespoke
design tokens, not a linear lightness axis — steps sit at equal
spacing even though luminance is compacted at the ends of the scale
(…90, 95, 99, 100). The dot grid plus the strength trace make that
condensation visible instead of hiding it.

Two traces over the steps:

1. **STRENGTH** — the applied light's intensity: L per step, 0–100.
   Because the x axis is equidistant steps, this line curves — flat
   segments show where the scale condenses.
2. **WAVELENGTH** — the applied light's colour: hue per step,
   unwrapped so wrap-around arcs (355°→38°) draw as one continuous
   line with no vertical jump.

A small legend identifies the traces (silkscreen labels; strength in
the neutral trace colour, wavelength in accent).

**Bottom axis:** each step's name (0, 10, … 99, 100) in tiny mono,
and under each name an elongated square (colour chip) of that step's
actual colour. This is where "the colour of each step" lives.

Overlays:

- Dots on both traces at each step.
- A cursor (vertical hairline) at the selected step, spanning traces
  and axis — the playhead. Follows swatch selection; the selected
  step's colour chip is highlighted.

## Functionality

- Redraws live while sliders move.
- Tapping/clicking the scope selects the nearest step (same effect as
  tapping that swatch).
- Rendered as inline SVG (crisp on any DPI, themeable with CSS vars).

## Placement

A dashboard masonry panel, placed after the presets block.
