---
name: schema
description: Client projects only. Read the Figma design (screenshots in docs/) and build the Sanity schemas, GROQ queries and page files in three phases, pausing for approval after each.
disable-model-invocation: true
argument-hint: "[optional: page slugs to limit the run, e.g. home about]"
---

# /schema

Turns the Figma design (today: the screenshots in `docs/`) into schemas, queries and page files. Follow `CLAUDE.md` for every convention. Code patterns (CTA, nav, testimonials, collections, dynamic routes, footer settings) are in `patterns.md` next to this file: read it before Phase 1.

## Guard

Read `package.json`. If `name` is `latz-starter`, stop and say: "/schema is for client projects. This is the starter, and only /promote edits it." Do nothing else.

## The Figma design is the source of truth

"The Figma design" means the screenshots in `docs/` today (`NN-<slug>-page-<section>.ext`, one per section). When the Figma MCP replaces screenshots, only this definition and the reading in Step 1 change; every rule below still says "the Figma design".

- **Required:** the Figma design. Nothing else.
- **Optional background:** overview, wireframe, content draft(s), design brief. They give context and suggest answers. They never override the Figma design.
- **Where an optional doc disagrees with Figma, Figma wins, and you list the difference in the analysis.** Never follow the doc silently, and never leave the difference out.
- **Behavior Figma can't show** (CMS vs hardcoded, what is a collection, filtering, who edits what, fixed vs variable counts) is asked in Step 2 against the final design. A doc can suggest an answer (offer it as the default), but Jordan decides.
- **Copy priority** for every piece of text: final copy visible in the Figma design, then the content draft where Figma shows placeholder text (lorem ipsum, "Heading goes here"), otherwise leave it empty and flag it. Figma comment pins are annotations, not copy.

## Step 1: Read, don't ask

Run `npm run docs -- --json` first: it lists the optional background docs it found
(overview, wireframe, brief, and every content draft), every page and its sections
in order, the schema group + component name each screenshot maps to, and any seed
file already in `docs/seed/`. Fix any naming problems it reports (or tell Jordan)
before continuing. Then read the rest yourself. **If there are no page screenshots,
stop** and say: "/schema needs the Figma design: add screenshots named
`NN-<slug>-page-<section>.png` to `docs/`." A missing overview, wireframe, content
draft or brief is fine: say which you found and carry on.

- **The Figma design:** every page screenshot. **View each image.** `$ARGUMENTS`
  limits which pages, if given.
- **Optional background docs**, whichever exist: overview, wireframe, every
  content draft, design brief. Read them as background and as the fallback copy
  source. Note every place one disagrees with the Figma design.
- Real files: `CLAUDE.md`, `sanity/schemaTypes/` (all, `index.js` first), `sanity/structure.js`, `sanity.config.js` imports, `sanity/presentation.js`, `data/queries/**`, `data/config/navigation.js`, `data/config/contact.js`, `utils/seo/buildPageMetadata.js`, `app/(site)/**/page.js`.
- Check `buildPageMetadata.js` takes `params` and falls back to `pageData?.page?.seo`. If not, fix it and tell Jordan it should go through `/promote`.
- Which schema files that `structure.js` names actually exist? Trust the folder, not the sidebar.

## Step 2: Analysis. Write no files. Then wait.

Present, concisely:

1. **Page inventory:** name, slug, singleton type (camelCase), sections as shown in the Figma design, standalone or compound query.
2. **Collections:** type, fields, which pages query them, who manages them.
3. **Changes from the starter:** pages added/removed (starter has home, about, services, contact), collections added/removed, nav changes, anything unneeded.
4. **Where the optional docs disagree with the Figma design.** List every difference (a section the wireframe has that Figma dropped, a reordered page, changed copy, a field the brief mentions that Figma doesn't show), doc by doc, and say Figma wins. If no optional docs exist, say so. Leave Figma comment pins out and flag them.
5. **Copy state, per page:** for each page, which text comes from Figma, which falls back to the content draft (placeholder text in Figma), and which is **missing** (left empty). This is what goes into `docs/seed/`.
6. **Contact fit:** compare the design's form fields against `contactConfig.formFields` and `sanity/schemaTypes/contactForm.js`. Flag mismatches.
7. **Behavior questions, asked against the final design.** Each one names what you see in Figma and offers a default, with the optional doc's suggestion where there is one ("wireframe says CMS; Figma shows a filterable grid"). Jordan answers; the doc never decides. Ask only what changes the output: CMS or hardcoded; single or multiple images; separate collection or inline array; shared singleton or per-page group; min/max limits; each CTA fixed or flexible; fixed or variable counts (default to an array); a preview of content owned by a page not being built yet (default: shared collection); more than one button treatment in nav or footer; testimonial shape; footer fields `seoSettings` lacks (`siteSettings`); who edits what.

Do not ask what the Figma design already shows (counts, layout, visible copy). Do ask behavior, even when a doc seems to answer it. **Stop. Wait for Jordan's answers.**

## Phase 1: Schemas

Write or update, then stop for approval:

- **Scaffold each page with the script.** For every page in the inventory run
  `npm run new-page -- <slug> [--title "..."] [--icon <IconName>]`. It creates
  the stub schema, query and page file and registers the page in
  `schemaTypes/index.js`, `structure.js` (sidebar + `singletonTypes`) and
  `presentation.js` `PAGES`. It is idempotent and skips what exists, so it is
  safe to run for every page. Pick an icon per page (verify with
  `node scripts/check-icon.mjs <name>`; it defaults to `Document`).
- Then fill in the real section fields in each `sanity/schemaTypes/<type>.js`,
  replacing the stub. **One numbered group per section in the Figma design, in design order**
  (the order `npm run docs` shows), the group named after the section
  (`landing-hero` → group `landingHero`). Singleton pages follow the `CLAUDE.md`
  schema rules: numbered groups with one object field per section, `title` first
  with `initialValue`, `seoField` once at the end, `🔍 SEO` group declared.
- Paragraph arrays, image arrays with `alt`, hotspot on images. `Rule.max`/`min` from the design.
- `initialValue` from the final copy in the Figma design (content draft where Figma shows placeholder text).
- `navigation.js`: `initialValue` listing every page, last link `isButton: true`. Add `children`, `buttonStyle`, `isExternal` only if the design needs them.
- Collections: `name` camelCase singular, `order` field when order matters and is not a date, `orderings`, meaningful `preview`. File fields: `options: { accept: '.pdf' }`.
- Pages not built this round stay stubs (`new-page` already made them title + SEO).
- Pages the design **drops** (a starter page not in the design): confirm with
  Jordan, then `npm run remove-page -- <slug>` (deletes the files and
  de-registers; it does not touch navigation content).
- **Collections** are manual (not scaffolded): add the schema file, and register
  it in `sanity/structure.js` and `schemaTypes/index.js` yourself.
- `sanity/structure.js`: `new-page` placed each page's sidebar item and
  `singletonTypes` entry. Adjust the icon or order if needed, and add collections,
  Form Submissions and settings in the existing style with `S.divider()`s. Keep
  the three exports `sanity.config.js` imports.
- **Icons:** run `node scripts/check-icon.mjs <names>` for every icon used (page
  icons and section-field icons). Subpath imports only. Reuse a safe icon over guessing.
- `sanity/schemaTypes/index.js`: `new-page` added the pages (grouped with the
  other `*Page` entries). Add collections, `siteSettings` yourself; keep the
  order navigation, pages, collections, siteSettings, seoSettings, contactForm.
- Never touch `seoSettings.js`, `contactForm.js` (unless step 2.5 found a field mismatch), `seoField.js`, `sanity.config.js`.

### Phase 1 also writes the seed files

Once the schemas are written, write the copy into `docs/seed/` so Jordan reviews it with the schemas, before anything reaches Sanity. Full shape and rules are in `seed.md` next to this file: read it first.

- One file per page, `docs/seed/<slug>.json` (`npm run seed -- --init <slug>` writes a skeleton from the screenshot group names). Other singletons (`navigation`, `siteSettings`) and collection items too, per `seed.md`.
- Walk the schema file you just wrote field by field, so every key, array and object matches it.
- Copy priority: final copy in the Figma design, then the content draft where Figma shows placeholder text, otherwise **omit the key** and add a `_todo` note so the gap is visible. Never invent copy, never lorem ipsum.
- Images: write the `alt` text, put `{ "$image": "<path or url>" }` where the image goes if the source is known, otherwise leave the image out. The seed skips images in this version.
- Validate with `npm run seed -- --dry-run --offline` (always `--dry-run` first). It checks the files without touching Sanity. Fix what it reports.
- **Do not run a real seed.** Seeding is Jordan's step, after Phase 3.

Run `npm run build` and `npm run lint`. Fix what breaks. Build catches import and syntax errors only, not Studio-level schema warnings (unknown group, duplicate field). Say so.

Then say: "Phase 1 done: <files>, plus docs/seed/<files> (copy from Figma; <N> fields missing, listed as _todo). Build and lint pass. Review the seed files like you review the schemas. Open /latz-studio and check for red or yellow warnings on each new document. Ready for queries?" **Stop.**

## Phase 2: Queries

After approval:

- `data/queries/pages/FETCH_<PAGE>_PAGE_QUERY.js`; collections get their own folder (`data/queries/<type>/`). Export name equals filename.
- Project every field in the schema, matching its structure. Singletons filter by `_type` and `_id`. Compound query for any page that shows a collection: `{ "page": ..., "<collectionKey>": ... }`.
- Resolve images `image{ asset->{url}, hotspot }` (arrays: `heroImages[]{ alt, image{ ... } }`), files `"fileUrl": file.asset->url`, references with `->{...}`, the standard `seo{...}` block.
- Dynamic routes also get `FETCH_<X>_SLUGS_QUERY.js` returning `{ "slug": slug.current }`.
- New `FETCH_SITE_SETTINGS_QUERY.js` if you added `siteSettings`. Never regenerate `FETCH_SEO_SETTINGS_QUERY.js`.
- `FETCH_NAVIGATION_QUERY.js`: project `label, url, isButton` (plus `buttonStyle`, `isExternal`, `children[]{label,url}` if the schema has them). Remove the `logo` projection: the navigation schema has no `logo` field.

Run `npm run build` and `npm run lint`. Then: "Phase 2 done: <files>. Ready for page files?" **Stop.**

## Phase 3: Page files

After approval. `new-page` already created each `app/(site)/<slug>/page.js`
(home is `app/(site)/page.js`) and added it to `PAGES`. Here you adjust those
page files to match the real queries:

- Placeholder content shows the page title (`data?.title`, or `data?.page?.title`
  for a compound query). Do not write section components: `/section` does that.
- **Existing page files whose query became compound** (`{ page, ... }`) must
  switch to `data?.page?.title` and `data?.page?.<group>`. Otherwise they
  silently fall back to the placeholder title with no error. Check every page
  file against its final query.
- If a section component already exists in `components/`, wire it with spread props.
- Dynamic routes use the pattern in `patterns.md` (`generateStaticParams` with
  `sanityClient`, params to `BPM`).
- **`sanity/presentation.js`:** `new-page` added each page to `PAGES`. You still
  add dynamic routes to `mainDocuments` with a `$slug` filter, and `siteSettings`
  to `GLOBAL_TYPES` if it exists.
- The project setup checklist already ships at `/design/checklist` (starter code).
  Do not recreate it on Home.
- Update `DARK_NAV_ROUTES` in `data/config/navigation.js` only if the design
  shows a dark-hero route. Ask if unsure.

Run `npm run build` and `npm run lint`. Fix what breaks. Then finish with: what was created, anything flagged, and what Jordan should check on localhost (each route loads, Studio shows the new documents, Presentation tool opens each page). Then the seed step, which is Jordan's:

1. `npm run seed -- --dry-run` shows what would be written and which drafts it would touch.
2. `npm run seed` writes it (fill-empty only; `--force` overwrites and is never the default).
3. Then `/section` for the first section, built against real data.

Do not run a real seed or `npm run dev`.
