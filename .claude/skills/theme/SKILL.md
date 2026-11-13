---
name: theme
description: Client projects only. Read the style guide screenshots in docs/style-guide/ into tokens.json, pause for review, then run the theme script to generate the design system.
disable-model-invocation: true
argument-hint: "(no arguments)"
---

# /theme

Turns the client's brand style guide into the project's themed foundation: the
colors, type scale and radius in `tailwind.config.js`, `app/globals.css` and
`app/layout.js`, plus the `/design` preview. This is **step one** for every
client, before `/schema` and `/section`. Follow `CLAUDE.md` for conventions and
`reference/style-guide-config-generator.md` for the mapping rules.

The split: **you** (judgment) read the screenshots and decide the slot mapping,
the class-to-style mapping, aliases and single-vs-split font, writing them into
`docs/style-guide/tokens.json`. The **script** (`npm run theme`) does the
mechanical regeneration of the four files from that JSON. Without Claude, Jordan
runs `npm run theme -- --init`, fills the JSON by hand, and runs `npm run theme`.

## Guard

Read `package.json`. If `name` is `latz-starter`, stop and say: "/theme is for
client projects. This is the starter, and only /promote edits it." Do nothing else.

## Step 1: Read

- The style guide screenshots in `docs/style-guide/`. View every image. If the
  folder is empty or missing, stop and ask Jordan to add the style guide there.
- The current `docs/style-guide/tokens.json` if it already exists (a re-theme).
- `reference/style-guide-config-generator.md` for the mapping rules (single vs
  split font, clamp behavior, `--heading-color`/`--accent-color`, one class per
  guide style, starter aliases kept, buttons out of scope).

## Step 2: Write tokens.json. Then STOP.

Write `docs/style-guide/tokens.json` (create `docs/style-guide/` if needed).
Shape, every field required unless noted:

- `colors`: the six slots `primary, secondary, accent, tertiary, dark, light`,
  each `{ "name": "<guide color name>", "hex": "#RRGGBB" }`. Mapping:
  `primary` = main brand / CTA color; `dark` = darkest neutral (may equal
  primary); `light` = lightest background; the rest fill `secondary, accent,
  tertiary` by prominence. Use the guide's hex values exactly.
- `headingColor`, `accentColor`: which slot drives `--heading-color` (normally
  `dark`) and `--accent-color` (default `secondary`).
- `fonts.heading`: `{ "family", "source": "google"|"local", "fallback":
  "sans"|"serif"|"mono", "italic": false }`. `fonts.body`: `null` for a single
  typeface, or the same shape when the guide uses a distinct body face (split
  mode). For `source: "local"`, add `"files": [{ "file": "Name.woff2", "weight":
  "400", "style": "normal" }, ...]` (placed in `app/fonts/`). Optional
  `"weights": ["400","600"]` to pin the loaded weights; otherwise the script
  collects them from the styles.
- `radius`: the standard roundness, e.g. `"0.5rem"` (usually the buttons'). One
  value; the script keeps only `none`/`DEFAULT`/`full`.
- `styles`: **one key per guide type style.** Keys are `h1`-`h6`, `hero-title`,
  and `.text-*` class names (write them without the dot: `text-paragraph-lg`).
  Each: `{ "guideName": "<label in the guide>", "size": "<rem>" (the clamp max),
  "weight": <number>, "lineHeight": "110%"|1.35|"normal", "letterSpacing":
  "<rem>" (optional, verbatim from the guide), "min": "<rem>" (optional, to
  override the derived fluid floor), "uppercase": true (optional), "font":
  "heading"|"body" (optional, only in split mode to override the default) }`.
  Reproduce the guide faithfully: if it has Paragraph Large and Paragraph Small,
  make `text-paragraph-lg` and `text-paragraph-sm`, don't collapse them. If the
  guide has no distinct hero size, mirror H1 into `hero-title` and note it.
- `aliases`: **keep every starter class the guide doesn't define**, pointing it
  at the nearest style so components don't break:
  `{ "text-overline": "text-caption", "text-paragraph": "text-paragraph-sm" }`.
  The starter ships `hero-title, text-overline, text-subheading, text-paragraph,
  text-caption, text-button`; any of these not in `styles` must be in `aliases`.

Buttons are out of scope (built by hand). Then present a short summary: the slot
mapping, single vs split font, which styles map to which classes, and any
aliases. **Stop and wait** for Jordan to check the hexes and values.

## Step 3: Run the script

After approval, run `npm run theme`. It validates `tokens.json`, regenerates the
`/* @gen:* */` regions of `tailwind.config.js`, `app/globals.css`,
`app/layout.js` and `data/config/theme.js`, and prints flags (slot mapping,
single/split, derived fluid mins, aliases, self-hosted font reminders). Read the
flags back to Jordan. If it fails validation, fix `tokens.json` and re-run; it is
deterministic and safe to re-run.

Then run `npm run build` and `npm run lint`. Fix what breaks. For a self-hosted
(`local`) font, remind Jordan to drop the `.woff2` files in `app/fonts/` (the
build fails until they exist) and to check the license for client use.

## Step 4: Hand off

Finish with: the slot mapping and font decision in one or two lines, anything
flagged (inferred radius, mirrored hero, a starter class aliased), and:
**"Check localhost:3000/design"** — the Colors and Typography tabs now show this
client's real system. Suggest `/schema` as the next step.
