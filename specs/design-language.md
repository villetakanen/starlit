# Starlit design language

Starlit is a light simulator with a token compiler attached: load a
material, set the atmosphere, read the 13-channel signal it emits.
The UI is a hardware mixing desk / measurement instrument, and every
block is a module on that desk. These rules keep the modules coherent.

## 1. Depth is semantic

- **Recessed (`surface-0` inside a panel) = display.** Things the
  machine shows you: the telemetry screen, the signal-monitor screen,
  output/value windows. You read them; you never "press" them (they
  may still accept selection clicks, but they *look* like glass).
- **Raised (`surface-20` on a card or the app surface) = control.**
  Things you touch: preset cards, step knobs, inputs.
- Cards (`surface-10`) are the panel plate modules mount on. A block
  may also mount its raised/recessed parts directly on the app
  surface, with its title printed there (signal monitor).

## 2. Amber is live signal

`--accent` (orange-amber LED, oklch 75% 0.16 65) marks live values,
selection (LEDs, rings, lit numbers), and primary actions. Never
decoration. Warning states use red (clip LED, oklch ~60% 0.21 27) and
are reserved for "the signal exceeds a physical limit".

## 3. Silkscreen and LED typography

- **Barlow, uppercase, letter-spaced** — what is printed on the
  panel: titles, labels, buttons.
- **IBM Plex Mono, tabular** — what the machine emits: every value,
  token name, code. Live values in accent; static/reference values in
  text or dim.

## 4. The grid and the module pattern

- Spacing and sizes sit on the 0.5rem (8px) grid; 4px is the
  permitted half-step for micro-offsets.
- One module, one job. Module titles use `.panel-title` on the
  surface the module mounts on. Blocks are specced in
  `specs/blocks/<name>/spec.md` before implementation.
- Selection is one global state (the selected step); every module
  that shows it uses the same LED language and the same keyboard
  bindings (arrows, Home/End).
