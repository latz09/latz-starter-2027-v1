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

Read these yourself. If `docs/` has no overview or no screenshots, stop and say which are missing.

- `docs/`: overview, wireframe, design brief, every `*.png` (view each image). `$ARGUMENTS` limits which pages, if given.
- Real files: `CLAUDE.md`, `sanity/schemaTypes/` (all, `index.js` first), `sanity/structure.js`, `sanity.config.js` imports, `sanity/presentation.js`, `data/queries/**`, `data/config/navigation.js`, `data/config/contact.js`, `utils/seo/buildPageMetadata.js`, `app/(site)/**/page.js`, `components/design/ProjectChecklist.js`.
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

- One file per page in `sanity/schemaTypes/`, one per collection. Replace the stubs. Singleton pages follow the `CLAUDE.md` schema rules: numbered groups with one object field per section, `title` first with `initialValue`, `seoField` once at the end, `🔍 SEO` group declared.
- Paragraph arrays, image arrays with `alt`, hotspot on images. `Rule.max`/`min` from the design.
- `initialValue` from the final copy in the screenshots.
- `navigation.js`: `initialValue` listing every page, last link `isButton: true`. Add `children`, `buttonStyle`, `isExternal` only if the design needs them.
- Collections: `name` camelCase singular, `order` field when order matters and is not a date, `orderings`, meaningful `preview`. File fields: `options: { accept: '.pdf' }`.
- Pages not built this round stay stubs (title + SEO group).
- `sanity/structure.js`: extend it in its existing style. Singletons first in site order, `S.divider()` between singletons, collections, Form Submissions, settings. Add each new singleton to `singletonTypes`. Keep the three exports `sanity.config.js` imports.
- **Icons:** run `node scripts/check-icon.mjs <names>` for every icon used. Subpath imports only. Reuse a safe icon over guessing.
- `sanity/schemaTypes/index.js`: barrel in order: navigation, pages (site order), collections, siteSettings, seoSettings, contactForm. Keep any existing entries you did not change.
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

After approval:

- `app/(site)/<slug>/page.js` per page, `app/(site)/page.js` for home. Follow an existing starter page: `BPM` in `generateMetadata`, `fc(Q)`, `PageContainer`, content inside `<Section>`, `export const revalidate = 10`. Placeholder content shows the page title (`data?.title`, or `data?.page?.title` for compound). Do not write section components: `/section` does that.
- If a section component already exists in `components/`, wire it with spread props. Otherwise leave the placeholder.
- **Existing page files whose query became compound** (`{ page, ... }`) must switch to `data?.page?.title` and `data?.page?.<group>`. Otherwise they silently fall back to the placeholder title with no error. Check every page file against its final query.
- Dynamic routes use the pattern in `patterns.md` (`generateStaticParams` with `sanityClient`, params to `BPM`).
- **`sanity/presentation.js`:** add every new page to `PAGES`, remove pages that no longer exist. Dynamic routes go in `mainDocuments` with a `$slug` filter. Add `siteSettings` to `GLOBAL_TYPES` if it exists.
- **Home page:** remove `ProjectChecklist` from `app/(site)/page.js`. Do not delete the component. Create `app/(site)/design/checklist/page.js` that renders it inside a `<Section>` (the `/design` layout already noindexes it and the sitemap excludes `/design`). Tell Jordan: it moves to `/design/checklist` because its items (Resend, CORS, inviting the client, SEO settings) are usually still open. Remove the page at launch.
- Update `DARK_NAV_ROUTES` in `data/config/navigation.js` only if the design shows a dark-hero route. Ask if unsure.
- Remove pages and routes that were cut (page file, schema, query, nav, `PAGES`), after confirming with Jordan.

Run `npm run build` and `npm run lint`. Fix what breaks. Then finish with: what was created, anything flagged, and what Jordan should check on localhost (each route loads, Studio shows the new documents, Presentation tool opens each page). Suggest `/section` for the first section. Do not run `npm run dev`.
