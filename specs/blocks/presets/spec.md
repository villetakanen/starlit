# The presets block

The presets block presents a set of pre-set values. It is the first
panel in the dashboard masonry.

## Visual Structure

Title: PHYSICAL MATERIAL PRESETS (shared `.panel-title` treatment:
uppercase, letter-spaced, dim)

A 2-column grid of tappable value controls, as miniature cards.
Each card contains:

- a color dot showing the preset's own L=50 anchor color
- the preset name (uppercase silkscreen label)
- an info line in mono: the hue arc `shadow°→anchor°→solar°` and the
  anchor step, e.g. `190°→145°→105° · L50`

The anchor step is per-preset: each carries its own `anchorL`, rendered
from the preset rather than assumed.

Presets (label / token family / shadow→anchor→solar / peak C / glimmer):

| Preset             | family    | arc            | C     | glimmer |
| ------------------ | --------- | -------------- | ----- | ------- |
| Deep Nordic Forest | forest    | 190°→145°→105° | 0.14  | 1.0     |
| Rowan Berry        | rowan     | 355°→38°→92°   | 0.19  | 1.15    |
| Hanami Sakura      | sakura    | 345°→5°→45°    | 0.11  | 0.9     |
| Citrus Fruit       | citrus    | 320°→60°→95°   | 0.18  | 1.3     |
| Urban Asphalt      | asphalt   | 265°→240°→85°  | 0.035 | 0.8     |
| Blueberry          | blueberry | 300°→264°→95°  | 0.16  | 0.85    |

## Functionality

Tapping a preset overrides the current settings (all sliders and the
token family name) with the preset values and highlights the card
(accent border via `aria-pressed="true"`). Editing any slider or the
family name clears the highlight — the state is no longer the preset's.
Exactly one or zero cards are highlighted at any time.
