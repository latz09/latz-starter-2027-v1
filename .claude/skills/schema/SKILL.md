---
name: schema
description: Client projects only. Read docs/ and build the Sanity schemas, GROQ queries and page files in three phases, pausing for approval after each.
disable-model-invocation: true
argument-hint: "[optional: page slugs to limit the run, e.g. home about]"
---

# /schema

Turns `docs/` (overview, wireframe, screenshots) into schemas, queries and page files. Follow `CLAUDE.md` for every convention. Code patterns (CTA, nav, testimonials, collections, dynamic routes, footer settings) are in `patterns.md` next to this file: read it before Phase 1.

## Guard

Read `package.json`. If `name` is `latz-starter`, stop and say: "/schema is for client projects. This is the starter, and only /promote edits it." Do nothing else.

## Step 1: Read, don't ask

Run `npm run docs` first: it lists the source docs, every page and its sections
in order, and the schema group + component name each screenshot maps to. Fix any
naming problems it reports (or tell Jordan) before continuing. Then read the rest
yourself. If `docs/` has no overview or no screenshots, stop and say which are missing.

- `docs/`: overview, wireframe, design brief, and every page screenshot
  (`NN-<slug>-page-<section>.ext`, one per section, NN sets order). **View each
  image.** `$ARGUMENTS` limits which pages, if given.
- Real files: `CLAUDE.md`, `sanity/schemaTypes/` (all, `index.js` first), `sanity/structure.js`, `sanity.config.js` imports, `sanity/presentation.js`, `data/queries/**`, `data/config/navigation.js`, `data/config/contact.js`, `utils/seo/buildPageMetadata.js`, `app/(site)/**/page.js`.
- Check `buildPageMetadata.js` takes `params` and falls back to `pageData?.page?.seo`. If not, fix it and tell Jordan it should go through `/promote`.
- Which schema files that `structure.js` names actually exist? Trust the folder, not the sidebar.

## Step 2: Analysis. Write no files. Then wait.

Present, concisely:

1. **Page inventory:** name, slug, singleton type (camelCase), sections as shown in the screenshot, standalone or compound query.
2. **Collections:** type, fields, which pages query them, who manages them.
3. **Changes from the starter:** pages added/removed (starter has home, about, services, contact), collections added/removed, nav changes, anything unneeded.
4. **Wireframe vs screenshot differences.** Screenshot wins on structure, wireframe on behavior (CMS vs hardcoded, filtering). Flag Figma comment pins and leave them out.
5. **Contact fit:** compare the design's form fields against `contactConfig.formFields` and `sanity/schemaTypes/contactForm.js`. Flag mismatches.
6. **Clarifying questions,** only ones that change the output: CMS or hardcoded; single or multiple images; separate collection or inline array; shared singleton or per-page group; min/max limits; each CTA fixed or flexible; fixed or variable counts (default to an array); a preview of content owned by a page not being built yet (default: shared collection); more than one button treatment in nav or footer; testimonial shape; footer fields `seoSettings` lacks (`siteSettings`).

Do not ask what the docs already answer. **Stop. Wait for Jordan's answers.**

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
  replacing the stub. **One numbered group per screenshot, in screenshot order**
  (the order `npm run docs` shows), the group named after the section
  (`landing-hero` → group `landingHero`). Singleton pages follow the `CLAUDE.md`
  schema rules: numbered groups with one object field per section, `title` first
  with `initialValue`, `seoField` once at the end, `🔍 SEO` group declared.
- Paragraph arrays, image arrays with `alt`, hotspot on images. `Rule.max`/`min` from the design.
- `initialValue` from the final copy in the screenshots.
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

Run `npm run build` and `npm run lint`. Fix what breaks. Build catches import and syntax errors only, not Studio-level schema warnings (unknown group, duplicate field). Say so.

Then say: "Phase 1 done: <files>. Build and lint pass. Open /latz-studio and check for red or yellow warnings on each new document. Ready for queries?" **Stop.**

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

Run `npm run build` and `npm run lint`. Fix what breaks. Then finish with: what was created, anything flagged, and what Jordan should check on localhost (each route loads, Studio shows the new documents, Presentation tool opens each page). Suggest `/section` for the first section. Do not run `npm run dev`.
