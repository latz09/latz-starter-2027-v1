---
name: section
description: Client projects only. Build one section component from a screenshot in docs/ against the page's real query data.
disable-model-invocation: true
argument-hint: "<page slug> <section name>, e.g. home hero"
---

# /section

Builds one section component at a time. Follow `CLAUDE.md` for every convention. `$ARGUMENTS` is the page slug and the section name. If either is missing or ambiguous, ask once.

## Guard

Read `package.json`. If `name` is `latz-starter`, stop and say: "/section is for client projects. This is the starter, and only /promote edits it." Do nothing else.

## 1. Read before writing

Do all of this first, silently:

- **Screenshot:** `docs/<slug>.png`, or the numbered/named files for that page. View them and find the section. If there is no screenshot for the page, stop and ask Jordan to add one. Ignore Figma comment pins. Read `docs/design-brief*` for design intent if it exists.
- **Data contract:** the page file `app/(site)/<slug>/page.js` and its query in `data/queries/`. The query is the source of truth for field names. Read the section's schema group in `sanity/schemaTypes/`. If a component stub already exists, read it and cross-check its props against the query: stubs drift.
- **This client's real design system, never the starter's or another client's:**
  - `tailwind.config.js`: the actual color slot hexes, `maxWidth`, spacing keys, radius keys.
  - `app/globals.css`: grep every `.text-*` / `.hero-title` class you plan to use. Use only what is defined.
  - `utils/cms/getSanityImageUrl.js`: current `IMAGE_PRESETS` (usually empty or partial).
  - `components/ui/ButtonLink.js`: if line 1 still says `STARTER TEMPLATE BUTTON`, flag it: "No button kit chosen yet (/design/buttons)." Use the existing variants meanwhile and say the button styling is provisional.
  - `app/layout.js`: how fonts are wired, in case the section depends on a font.
- Existing components in `components/` worth reusing (headings, cards, graphics). Reuse before creating.

## 2. Build

- File in `components/sections/<Page>/<SectionName>.js` (or the folder convention the project already uses). Default export. `.js` only.
- **Spread props:** the page spreads the schema group (`<Hero {...hero} />`) and the component destructures named props. Update the page file to render the component. For a compound query, pass the collection as its own prop next to the spread.
- Wrap in `<Section>`: `as='header'` for the page hero, `bg` for full-bleed color, `py` only to override the default, `className` for layout. Do not edit `Section.js`.
- `<ButtonLink>` for every CTA, with an explicit `variant`. Read `VARIANTS` and pick one that contrasts with the section background: on a `bg-primary` band, `primary-on-dark` is primary on primary and disappears. `<SanityImage>` for every CMS image: fixed-frame slot gets a named `IMAGE_PRESETS` entry (one per component), variable-aspect slot gets `customSize` from source metadata. `fill` only inside a `relative` box with a height. Real `alt` text.
- One `h1` per page. The hero uses `h1`, every other section starts at `h2`.
- Type: `h1`-`h6` plus only the `.text-*` classes confirmed in this client's `globals.css`. Color: only the six slots. Spacing: literal-rem keys from the config. No literal `py-${n}`.
- Strings from the CMS used in comparisons: `stegaClean()`.
- Motion: Framer Motion, restrained. Marquees get a reduced-motion override and hover-to-pause.
- If the design needs something the data does not have (a field missing from schema or query), do not invent it and do not hardcode CMS content. Stop and tell Jordan which field is missing, and suggest `/schema` or a manual schema edit.

## 3. Verify and hand off

Run `npm run build` and `npm run lint`. Fix what breaks. Never run `npm run dev`.

Finish with a short note:

- Files created or changed.
- Anything flagged (provisional button, missing field, a preset you added, a class you avoided because it is not defined).
- **What to check on localhost:** the route to open, what should match the screenshot (layout, spacing, type, image crops), the breakpoints that matter for this section (mobile and the widest design width), and the hover or motion states. If the section is editable, check it in the Presentation tool.
