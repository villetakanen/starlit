# The channel strip block

The channel strip is where a step is selected and its exact values are
read — like selecting a channel on a mixing desk and reading its
meters. It replaces the current full-width swatch bars and the separate
inspector card.

## Visual Structure

Title: CHANNEL STRIP — rendered on the panel surface (the card, shared
`.panel-title` treatment). The raised blocks inside carry no titles.

One dashboard panel (card) containing **two raised blocks** side by
side. Raised = one surface level above the card (`surface-20`
background, 8px radius), the opposite of the telemetry's recessed
screen.

### 1. Step selector (narrow strip)

A narrow vertical strip of squares, one per token step, top (0) to
bottom (100). Each square:

- filled with the step's actual colour
- the step's hue degrees centred on it, in mono, contrast-aware
  (surface-10 text on light colours, surface-90 on dark)
- the step number as a tiny corner label, so the channel stays
  identifiable when neighbouring hues are equal
  *(addition beyond the original ask — veto if unwanted)*

The selected square is marked with the LED language established in the
telemetry (accent ring or dot), and selection stays in sync with the
telemetry playhead, both directions.

### 2. Readout (chosen colour specs)

Next to the selector, a second raised block displaying the selected
step's full specs:

- a larger square of the colour itself (the "monitor")
- the token name (`--chroma-<family>-<step>`) in accent mono
- the OKLCH components broken out as labelled readouts, silkscreen
  label + mono value: L, C, H
- the CSS value line (`oklch(L% C H)`) ready to read or copy

## Functionality

- Tapping a square selects that step; selection drives and follows the
  same global selected-step state as the telemetry and updates the
  readout instantly.
- Keyboard: the selector is focusable; Up/Down (and Left/Right) move
  the selection, Home/End jump to the ends — same bindings as the
  telemetry.
- All values update live while sliders move.

## Placement

Replaces the current `.scale-panel` (swatch strip) and `.inspector`
panels in the dashboard masonry — one panel where there were two.
