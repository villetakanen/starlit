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

Three traces over the steps, sampled densely (every L) and mapped
piecewise between the equidistant step positions so curves stay
smooth:

1. **STRENGTH** — the applied light's intensity: L, 0–100. Because
   the x axis is equidistant steps, this line curves — flattening
   shows where the scale condenses.
2. **WAVELENGTH** — the applied light's colour: hue, unwrapped so
   wrap-around arcs (355°→38°) draw as one continuous line with no
   vertical jump. Solid accent stroke.
3. **CHROMA** — C(L), the pigment bell plus solar glimmer flare.
   Dashed accent stroke with a faint area fill; fixed 0–0.4 range so
   presets are comparable.

A small legend identifies the traces (silkscreen labels; strength in
the neutral trace colour, wavelength/chroma in accent).

**Ribbon:** below the screen, a continuous strip of the actual color
at every L, on the same equidistant-step mapping.

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
