# Starlit — agent notes

Mobile-first studio for hue-shifting OKLCH color token scales.
Vanilla TypeScript + Vite, Biome for lint/format, no framework, no CDN
dependencies (fonts self-hosted via Fontsource).

## ASK

- before pushing on your own

## Commands

- `npm run dev` — Vite dev server (port 5173)
- `npm run build` — type-check and build
- `npm run lint` — Biome check
- `npm run format` — Biome format

## Layout of the code

- `src/scale.ts` — the color engine: hue arc (piecewise shortest-path
  smoothstep, monotonic by construction) and chroma curve (pigment bell
  + solar glimmer flare). Keep it pure and framework-free.
- `src/main.ts` — DOM wiring only; no color math here.
- `src/style.css` — mobile-first base, desktop enhancements only inside
  `@media (min-width: 768px)`, hover only inside
  `@media (hover: hover) and (pointer: fine)`.

## Conventions

- Site palette comes from the `--color-surface-[level]` scale in
  `style.css` (linear OKLCH lerp, #12161A → #FFF5F7). Don't introduce
  neutrals outside it; derive alphas with `color-mix` over its ends.
- Typography: Barlow for panel labels (uppercase, letter-spaced),
  IBM Plex Mono for every value readout and token name.
- Mobile-first, not mobile-only: the base layout is the 390px column;
  wider viewports only add, never change, the base.
- Work items live in GitHub issues (`gh issue list`) — atomic tasks, one
  task = one commit, close the issue from the commit that lands it.
- Run `npx biome check --write .` and `npm run build` before committing.
