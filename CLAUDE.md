@AGENTS.md

# Latz starter: rules for Claude Code

Next 16 (App Router, Turbopack), React 19, next-sanity 13, Sanity 6 embedded at `/latz-studio`, Tailwind 3.4, Framer Motion 12. Everything is `.js`, never `.ts`. Read the real files before writing: they are the source of truth, this file is only the rules.

## Working rules

- Jordan runs `npm run dev` in his own terminal. Never start it. Edit files, then run `npm run build` and `npm run lint` yourself and fix what they report.
- Never push, never deploy, never run `vercel`. Vercel deploys on push and Jordan pushes. Commit only when asked.
- Never read `.env*` files (`.env.example` is fine). Never put tokens in code.
- Windows + Git Bash: no `tar`, no bash-only syntax in commands Jordan will run, no spawning `npm`/`npx` from Node without a shell. In scripts use Node APIs (`node:fs`, `node:path`), not shell tools.
- If `package.json` name is `latz-starter` you are in the starter, not a client project. Only `/promote` edits the starter. `/schema` and `/section` stop there.
- `/schema`, `/section`, `/promote` live in `.claude/skills/`. Per-client source material is in `docs/`.

## Where things live

```
app/(site)/...            public pages + site layout. app/layout.js is the minimal root.
app/latz-studio/          embedded Studio. Never wrap it in site chrome.
sanity/schemaTypes/       schemas (index.js is the barrel). sanity/structure.js = sidebar.
sanity/presentation.js    PAGES list for live preview. sanity/branding.js = per-client Studio settings.
data/queries/<area>/      one GROQ file per query. data/config/ = contact, navigation, redirects.
utils/cms/                fetchContent (fc), sanityConnection, getSanityImageUrl, fetchSeoSettings.
utils/seo/                buildPageMetadata (BPM).
components/layout/Section.js, components/ui/{ButtonLink,SanityImage}.js, components/forms/
```

## Tailwind guardrails

- **Six color slots only:** `primary`, `secondary`, `accent`, `tertiary`, `dark`, `light`, plus `transparent`, `current`, `white`, `black`. The default palette is replaced: no `gray-500`, `blue-600`. Opacity modifiers are fine (`bg-dark/50`).
- **`fontSize` is empty.** `text-sm`, `text-lg`, `text-2xl` do nothing. Sizes come from `h1`-`h6` and the `.text-*` classes in `app/globals.css`.
- **Before using any `.text-*` class, grep `app/globals.css` for it.** Themed projects rename or drop classes (the starter has `.hero-title`, `.text-overline`, `.text-subheading`, `.text-paragraph`, `.text-caption`, `.text-button`). A class that is not defined silently applies nothing.
- **Spacing is literal rem, not Tailwind's /4 scale.** `p-4` is 4rem. Quarter-rem steps from `0` to `12`. Check `tailwind.config.js` for the exact keys before using an odd one.
- **Radius:** `rounded-none`, `rounded` (DEFAULT), `rounded-full` only. If `sm`/`lg`/`2xl` still exist the theme step was skipped: flag it.
- **Shadows:** `shadow-soft`, `shadow-card`, `shadow-lifted`, `shadow-none`.
- **Text color is one variable:** `--heading-color` drives every heading and `.text-*` class. Never put a literal color in a type rule.
- Class names must be written out literally. Never build them at runtime (`` `py-${n}` ``).
- Do not touch `--nav-h`, `--hero-pt`, `.section-x-padding`, `:focus-visible`, `.scrollbar-hide`, `.no-scroll`.

## Data conventions

- Pages call `fc(Q)` (`fetchContent`) and `BPM({ slug, query })` (`buildPageMetadata`). Singleton queries filter `_type == "x" && _id == "x"`.
- Query exports are named exactly like the file: `FETCH_HOME_PAGE_QUERY` in `FETCH_HOME_PAGE_QUERY.js`. No exceptions.
- **Spread props.** The page destructures each schema group and spreads it: `<Hero {...hero} />`. Components destructure named props (`({ headline, subheadline })`), never one `data` object.
- **Compound queries** return `{ page, <collectionKey> }`, named for what the collection holds (`serviceOfferings`, `documents`), never `items`. Destructure page groups from `data?.page || {}`, spread them as usual, and pass the collection as its own prop: `<Services {...services} serviceOfferings={serviceOfferings} />`. Page title is `data?.page?.title`.
- Cross-check a component's props against the page's real query. Stubs drift from queries.
- Images in queries: `image{ asset->{url}, hotspot }` (`SanityImage` needs `asset` and `hotspot`). Files: `"fileUrl": file.asset->url`. SEO block is projected the same way on every page (copy it from an existing query).

## Section, ButtonLink, SanityImage

- **`<Section>`** (`components/layout/Section.js`): wrap every section's content in it. Props: `as` (outer tag, default `section`; use `header` for the hero), `id` (outer tag, for anchors), `bg` (class on the OUTER tag so the color runs edge to edge), `py` (inner div, full literal class string, default `py-5 lg:py-8.75`; pass only to override), `className` (inner div: height, grid, gap). Default import. It is starter code: client builds do not edit it, changes go through `/promote`.
- **`<ButtonLink>`**: props `href`, `variant`, `external`, `className`, `event`, `children`. If the top of `components/ui/ButtonLink.js` still says `STARTER TEMPLATE BUTTON`, no button kit has been chosen: flag it to Jordan, do not design around it silently. Always pass `variant` explicitly from the keys in `VARIANTS` (the default `primary-light` is not one of them in the starter).
- **`<SanityImage>`** + `IMAGE_PRESETS` (`utils/cms/getSanityImageUrl.js`): `IMAGE_PRESETS` starts as `{}`. Read the client's current file, never assume a preset exists. Fixed-frame slot (same crop every time): add a named preset, one per component. Variable-aspect slot: pass `customSize` computed from `image.asset.metadata.dimensions.aspectRatio`. Use `fill` when the parent defines the box (`relative` + height), fixed width/height otherwise. Never override `objectPosition` (hotspot is automatic). Write real `alt` text, or use the schema's `alt` field for image arrays.
- One `h1` per page (the hero). Everything after starts at `h2`.
- Carousels and marquees: marquees need a `prefers-reduced-motion` override and hover-to-pause. Use `bg-primary`-style real tokens, not invented color names.

## Schema conventions

- **Page schemas** are singletons: `name` camelCase (`homePage`), `type: 'document'`, first field `title` with `initialValue`. Each section is an **object field assigned to a numbered group** (`① Hero`, `② ...`), because whole groups are passed to components. `🔍 SEO` is always the last group, and must be declared in `groups` even on a title-only stub.
- **SEO:** `import { seoField } from './partials/seoField'` (named import). Spread it exactly once, at the end: `...seoField.map((f) => ({ ...f, group: 'seo' }))`.
- Images: `options: { hotspot: true }`.
- **Multi-paragraph copy is an array of paragraphs**: `type: 'array', of: [{ type: 'text', rows: 4 }]`, `Rule.max(N)` matching the design. Never one `text` field with `\n\n`. A single paragraph stays a plain `text` field.
- **Image arrays (more than one image in a field) are objects with `image` and `alt`.** A single standalone image needs no wrapper.
- `initialValue` comes from the final copy visible in the screenshots (headlines, CTA labels, headings). Not lorem ipsum, not Figma comment pins.
- **Icons:** `@sanity/icons` has no root named exports. One subpath import per icon: `import { CogIcon } from '@sanity/icons/Cog'`. Verify before use: `node scripts/check-icon.mjs Cog Home`. Never guess a name.
- `structure.js` must export `structure`, `singletonActions`, `singletonNewDocument` as `sanity.config.js` imports them. Add every singleton to `singletonTypes`. Extend the real file in its existing style.
- Fixed-destination CTA: only a `label` field. Flexible CTA: `label` + `url`. CTA to a CMS document: a `reference`. Fixed link groups: named string fields, not an array.
- `seoSettings` and `contactForm` schemas, `FETCH_SEO_SETTINGS_QUERY`, `sanity.config.js`, and `Section.js` are not regenerated by `/schema`. Footer extras that `seoSettings` lacks go in a new `siteSettings` singleton.
- Full patterns (nav, testimonials, collections, dynamic route) are in `.claude/skills/schema/patterns.md`.

## Contact form

- `data/config/contact.js` (`contactConfig`) is the single source of truth: branding, `formFields`, `messaging`, `features.autoResponseEmail` (paid add-on, default `false`).
- Field names are `phone` and `submittedAt` everywhere (config, API route, schema, emails). Form lives in `components/forms/`. `emailLogo` is on `seoSettings` and overrides the config logo in `pages/api/submitContactForm.js`.
- If the design's fields differ from the defaults, edit `contactConfig.formFields` and `sanity/schemaTypes/contactForm.js` together.
- Any button that changes behavior after a successful submit must stop being `type="submit"` (native required-field validation blocks the click otherwise).

## Known gotchas

- **`draftMode()` throws outside a request.** Never call `fc`/`fetchContent` in `generateStaticParams`. Use `sanityClient.fetch(SLUGS_Q)` from `@/utils/cms/sanityConnection` (`sanityClient` is `null` with no project ID, so guard: `(await sanityClient?.fetch(SLUGS_Q)) || []`).
- **Dynamic routes must pass params to BPM:** `BPM({ slug: `/parent/${slug}`, query: Q, params: { slug } })`, with `const { slug } = await params`.
- **`stegaClean()`** (from `next-sanity`) on any CMS string used in a comparison or as a class/key (`if (style === 'dark')`). Draft mode adds invisible characters.
- **Every new page goes into `PAGES` in `sanity/presentation.js`.** Dynamic routes also go in `mainDocuments` with a `$slug` filter.
- Full-bleed two-column heroes: the outer edge needs `padding + max(0, gap)`, not `max(padding, gap)`. Pull the `container`/`wide` widths from the client's `tailwind.config.js` `maxWidth`.
- Builds and runs with no Sanity project ID (placeholders). Keep it that way: guard anything that touches `sanityClient`.
- **On every next-sanity upgrade**, re-check `components/ui/VisualEditingClient.js` (debounced `router.refresh()` on draft edits) and the draft-mode API. A bump once broke live preview.
- `next dev` writes `AGENTS.md` (imported above). Leave it alone and commit it with your work.

## Upstream docs

- Client-facing generators (overview, wireframe, design brief) run in chat and are exported to `docs/`. See `docs/README.md`.
- The older generator docs (Schema & Query, Build Companion, Style Guide, Contact Form System, Privacy & Accessibility) live in the Claude Code project in claude.ai under `reference/`. This file and the skills replace the first four for code work. The Style Guide generator is still used for theming until `/theme` exists. Starter history: `claude/02-merged-starter-v1.md` in the same project, and `CHANGELOG.md` here.

## Client project

<!-- Empty in the starter. Per client: name, domain, design decisions, deviations from the starter, open questions. /promote never copies this section back. -->
