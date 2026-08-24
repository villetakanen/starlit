# The signal monitor block

The signal monitor is where a step is selected and its exact values
are read — like patching into one channel on a desk and watching its
meters. It replaces the earlier full-width swatch bars and the
separate inspector card.

## Visual Structure

Title: SIGNAL MONITOR — rendered directly on the app surface (the
page background), shared `.panel-title` treatment. There is **no card
behind this block**: the two raised blocks sit straight on the app
surface. The raised blocks themselves carry no titles.

Two raised blocks side by side (raised = `surface-20` background,
8px radius — the opposite of the telemetry's recessed screen).

### 1. Step selector (narrow strip)

A narrow vertical strip of true squares (44×44), one per token step,
top (0) to bottom (100). Each square:

- filled with the step's actual colour
- the step number centred on it, in mono, contrast-aware
  (surface-10 text on light colours, surface-90 on dark)

No other markings on the squares — hue degrees live on the telemetry
chips and in the readout.

The selected square is ringed in the accent LED colour, and selection
stays in sync with the telemetry playhead, both directions.

### 2. Readout (chosen colour specs)

Next to the selector, the second raised block displays the selected
step's full specs, stretched to the selector's height:

- a larger square of the colour itself (the monitor)
- the token name (`--chroma-<family>-<step>`) in accent mono
- the OKLCH components broken out as labelled readouts, silkscreen
  label + mono value: Lightness, Chroma, Hue
- the CSS value line (`oklch(L% C H)`) anchored at the block's bottom

## Functionality

- Tapping a square selects that step; selection drives and follows the
  same global selected-step state as the telemetry and updates the
  readout instantly.
- Keyboard: squares are focusable; Up/Down (and Left/Right) move the
  selection, Home/End jump to the ends — same bindings as the
  telemetry. Focus follows the selection.
- All values update live while sliders move.

## Placement

A dashboard masonry section (not a card), after the waveform
telemetry.
