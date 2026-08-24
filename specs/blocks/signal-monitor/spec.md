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

### 2. Readout — the OSD monitor (a display, not a control)

Next to the selector, the readout is a **recessed display** per the
depth grammar (specs/design-language.md): a `surface-0` bezel whose
screen is filled edge-to-edge with the selected colour itself — you
are looking at the signal on a broadcast monitor. The data overlays
it like a camera OSD on translucent dark strips:

- top corner: the token name (`--chroma-<family>-<step>`) in accent
  mono on a translucent chip
- bottom OSD strip, carrying seven data points — *what is it, how is
  it built, will it survive the screen, what can sit on it, how do I
  take it*:
  - **Lightness** and **Chroma** with LED bar meters against their
    full ranges (0–100%, 0–0.4)
  - **Hue** as a number only (circular quantity — a bar position
    would lie)
  - **sRGB**: the gamut-mapped hex fallback, with a **clip LED** that
    lights red when the raw OKLCH exceeds the sRGB gamut
  - **Contrast vs 0 · 100**: WCAG contrast ratios against the scale's
    own darkest and lightest tokens, ✓ at ≥ 4.5
  - the CSS value (`oklch(L% C H)`) in an output window with a COPY
    button that copies the colour

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
