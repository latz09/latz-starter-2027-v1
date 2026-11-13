# Changelog

Starter versions. Client projects record the version they began from in `package.json` → `latzStarter`.

Format: one section per version, newest first. Patch = fix, minor = new feature, major = breaks existing client code.

---

## 1.1.1 (2026-11-13)

### Fixed
- `ButtonLink` default `variant` was `'primary-light'`, which is not a key in `VARIANTS`, so a button with no `variant` got no color styling. Default is now `'primary-on-light'`. `CLAUDE.md` no longer warns about the broken default. Found in latz-pilot-test.

## 1.1.0 (2026-11-13)

Adds the Claude Code layer. No change to the site, Studio or dependencies.

### Added
- `CLAUDE.md`: the rules distilled from the Schema & Query, Build Companion, Style Guide and Contact Form System generator docs. Imports `AGENTS.md` (written by `next dev`) instead of replacing it.
- `.claude/skills/schema`: `/schema` replaces the Schema & Query Generator. Analysis, then schemas, queries and page files with approval after each phase. Reads the real starter files, updates `sanity/presentation.js`, runs the build per phase. Code patterns in `patterns.md`.
- `.claude/skills/section`: `/section` replaces the Build Companion. One section at a time from a screenshot, against the page's real query and the client's actual `globals.css`, color slots, `IMAGE_PRESETS` and `ButtonLink` state.
- `.claude/skills/promote`: `/promote` ports a client fix into the starter (second working folder), strips client values, updates `CLAUDE.md`, runs the starter build, bumps the version and adds a CHANGELOG entry. Never commits or pushes.
- `.claude/settings.json`: allows build, lint and read-only git; asks before installs and commits; denies `git push`, `vercel` and reading real `.env` files (Bash and PowerShell).
- `docs/README.md`: per-client source material convention (overview, wireframe, design brief, screenshots named by slug).
- `scripts/check-icon.mjs`: checks `@sanity/icons` subpath imports exist (`node scripts/check-icon.mjs Cog Home`).

### Decisions
- Generator rule "Home renders Typography/ColorPalette/ButtonPreviews" is dropped. Those stay at `/design`. When `/schema` builds Home it moves `ProjectChecklist` to `/design/checklist` (noindexed with the rest of `/design`); remove that page at launch.
- `Section.js` is starter code, not "never modified": it changes only through `/promote`.
- `/schema` and `/section` stop if `package.json` name is `latz-starter`; only `/promote` edits the starter.
- The generators' canonical `sanity.config.js` / `structure.js` / "confirmed-safe icon" sections are gone. Commands read the real files.
- `navigation` query no longer projects `logo` (the schema has no such field); `/schema` removes it in client builds.

---

## 1.0.0 (2026-11-12)

First version of the merged starter. Replaces `July-2026-Starter-Template` (Next.js) + `latz-cms-template` (Sanity overlay + `apply-template.sh`).

### Architecture
- One repo: Sanity Studio embedded at `/latz-studio` (`basePath` to match). No more separate Studio repo or `sanity deploy`.
- `app/(site)/` route group so the site layout (nav, footer, globals.css, Tailwind preflight) never wraps the Studio. Minimal root layout. `SiteShell` shared by the site layout and the root 404.
- Schemas, `structure.js` and Studio components moved to `sanity/`. New `sanity/env.js` (shared connection settings) and `sanity/branding.js` (the one per-client Studio file: title, logo, CMS guide URL, colors).
- Presentation tool (live preview + click-to-edit) with draft mode and stega. `sanity/presentation.js` maps documents to routes.
- Builds and runs with no Sanity project ID (placeholder content, "not connected" Studio screen).
- `scripts/new-client.mjs` replaces `apply-template.sh`: copies the starter, creates the client's own Sanity organization + project, CORS, both API tokens, `.env.local`, first commit.

### Versions (all pinned exactly)
- Next 15.5 → **16.4.6** (required by next-sanity 13). `middleware.js` → `proxy.js`, `next lint` → `eslint .`, Turbopack is the default bundler.
- next-sanity 9 → **13.4.0**, sanity **6.23.0**, @sanity/vision 6.23.0, @sanity/image-url **2.1.1** (`createImageUrlBuilder`)
- React **19.3.1**, Tailwind **3.4.19** (staying on v3), Framer Motion **12.43.0**
- `engines.node` `>=22.12`
- Dropped: `@sanity/themer` (Studio theme now uses `buildLegacyTheme` from `sanity`), `@sanity/visual-editing` (bundled in next-sanity), `multiparty` (unused)

### Fixed (from the July starter)
- Contact API imported `clientConfig`; config exports `contactConfig`
- `buildPageMetadata`: added `params` pass-through and the `seo ?? page.seo` fallback for compound queries; stega-cleans page SEO
- Contact form field names now agree everywhere: `phone` + `submittedAt` (config, API route, schema, email templates)
- Query files renamed so exports match filenames: `FETCH_HOME_PAGE_QUERY.js`, `FETCH_CONTACT_PAGE_QUERY.js`. Home query filters by `_id` like the others.
- `Section`: default `py-5 lg:py-8.75`, new `id` prop
- Fonts resolve in the raw starter: one face loaded as `--font-heading`, `fontFamily.default` points at it (single-font default, matches the Style Guide generator)
- `IMAGE_PRESETS` starts empty; `SanityImage` falls back to a default size instead of crashing
- Page files use `<Section>`; contact page renders the form
- `createClient` no longer runs with an empty project ID
- Resend client created per request, so the API route no longer crashes without `RESEND_API_KEY`
- `BaseModal` mount logic rewritten for the React Compiler lint rules; `shadow-lg` (not in the config) → `shadow-lifted`
- Footer reads seoSettings without stega (it feeds `tel:`/`mailto:` links)

### Changed
- Contact form moved to `components/forms/` and brought in line with the Contact Form System doc: 2-column grid (textarea/radio full width), success/reset button, `emailLogo` on seoSettings with a live override in the API route
- Sanity tokens split: no token for published reads, viewer token for draft mode, editor token only in the contact API route
- `USE_CMS` is derived from `NEXT_PUBLIC_SANITY_PROJECT_ID` instead of a hand-flipped flag
- `/latz-studio`, `/design`, `/cms-guide.html`, `/api` noindexed (header + sitemap + robots.txt)
- MTSCW's SVG `?url` rule, ported to Turbopack
- Redevelopment Resources' `data/config/redirects.mjs` pattern, wired into `next.config.mjs`
- Vision (GROQ playground) in the Studio only in development
- Sitemap/robots output gitignored; placeholder `siteUrl` no longer defaults to latzwebdesign.com

### Removed
- `data/set-up/` (`SanitySetup.js`, `SEOSetup.js`, env and schema templates): the starter is the setup now. Env template → `.env.example`.
- `lib/seo/mainLayoutMetadata.js`, `lib/seo/pageMetadata.js` (unused)
- `createElement` workaround in `sanity.config.js` (Next compiles JSX in `.js`)
