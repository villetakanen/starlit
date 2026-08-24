# Starlit

A mobile-first studio for generating biologically and physically plausible,
hue-shifting OKLCH color token scales.

Instead of linearly desaturating around a single static hue, Starlit models
the dual-light physics of natural materials:

- **Local material anchor (L 40–60):** the pigment's unoccluded hue, where
  peak chroma lives.
- **Solar flare pull (L 70–95):** hue rotates toward warm solar yellow/amber
  as lightness rises, keeping an energetic chroma glimmer instead of washing
  out to chalk, before resolving into a warm tinted off-white at L 99.
- **Ambient shadow drift (L 10–30):** hue rotates toward cool skylight blues
  or deep wine/plum as lightness drops.
- **Monotonic arc:** the whole path from shadow through anchor to highlight is
  one smooth shortest-path hue arc — no flips, no grey dead zones.

## Usage

```sh
npm install
npm run dev
```

Pick a preset (Nordic Forest, Rowan Berry, Hanami Sakura, Mineral Slate) or
tune the anchor, solar, and shadow hues, peak chroma, and solar glimmer with
the sliders. Tap any swatch to inspect its exact OKLCH values, then copy the
generated `:root { --chroma-<family>-<step>: … }` block with one tap.

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — type-check and build for production
- `npm run lint` — lint with Biome
- `npm run format` — format with Biome

## License

[MIT](LICENSE)
