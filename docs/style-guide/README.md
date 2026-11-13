# docs/style-guide/

The client's brand style guide, and the tokens file `/theme` builds from it.
`/schema` and `/section` ignore this folder, so screenshots here are never
mistaken for page screenshots.

## What goes here

| File | What it is |
|---|---|
| `*.png` (or jpg/webp) | Style guide screenshots: colors, typography, radius. Any names. |
| `tokens.json` | The design system as data. `/theme` writes it from the screenshots; `npm run theme` reads it. |

## The flow

1. Drop the style guide screenshots in this folder.
2. `/theme` reads them, writes `tokens.json`, and pauses so you can check the
   hexes and type values.
3. `npm run theme` regenerates `tailwind.config.js`, `app/globals.css`,
   `app/layout.js` and `data/config/theme.js` from `tokens.json`.
4. Check `localhost:3000/design`.

Without Claude: `npm run theme -- --init` writes a blank `tokens.json`; fill it
in by hand and run `npm run theme`. `npm run theme -- --dry-run` shows what would
change without writing. See the shape in `.claude/skills/theme/SKILL.md`.

`tokens.json` is this client's. It is not copied to the starter; `/promote`
strips it.
