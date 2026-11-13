# docs/

Per-client source material. Claude Code commands read from here, so nothing
gets pasted into chat. This folder is empty in the starter. Fill it at the start
of each client build.

Run `npm run docs` any time to see exactly what `/schema` and `/section` will
read: the Figma design, the optional background docs found, every page and
section in order, and any screenshot whose name is wrong.

## The Figma design is the source of truth

**The Figma design is the only required input.** Today that means the page
screenshots, one per section (naming below). When the Figma MCP replaces
screenshots, this is the one definition that changes; every rule in here and in
the skills stays the same.

Everything else is optional background: the overview, wireframe, content draft
and design brief. They give context and suggest answers, and they are often out
of date by build time (the designer reworks sections, layout and copy in Figma
after the wireframe sells the job). So:

- **Where an optional doc disagrees with Figma, Figma wins.** `/schema` lists
  every difference in its analysis instead of following the doc silently.
- **Behavior Figma can't show** (CMS vs hardcoded, what is a collection,
  filtering, who edits what) is asked in `/schema`'s analysis, against the final
  design. A doc can suggest an answer; Jordan decides.
- **Copy priority:** final copy visible in Figma, then the content draft where
  Figma shows placeholder text, otherwise left empty and flagged.
- The overview is still the place for business info (SEO settings, later
  `/legal`), but nothing needs it to build schemas.

## What goes here

| File | Required? | What it is | From |
|---|---|---|---|
| `NN-<slug>-page-<section>.png` | **Yes** | The Figma design: one screenshot per section (see below) | Figma export |
| `overview.html` | optional | Scope, pages, collections, client context | Overview generator (chat) |
| `wireframe.html` | optional | Page structure, suggested CMS vs hardcoded | Wireframe generator (chat) |
| `content-draft.html` | optional | The wireframe with the first copy written out | Jordan |
| `design-brief.html` | optional | Design direction | Design brief generator (chat) |

The four background docs are matched by keyword in the filename
(`overview`, `wireframe`, `content`, `brief`), case-insensitive, and can be
`.html`, `.md`, `.txt` or `.pdf`. So `updated-wireframe-with-pre-launch-page.html`
still reads as the wireframe and `home-content-draft.html` as a content draft.

- A file goes to the first keyword it matches, with `content` first: so
  `wireframe-content-draft.html` is a content draft, not the wireframe.
- Overview, wireframe and brief: if two files match one keyword, the newest is
  used. **Content drafts: every match is read** (one per page is fine).
- Don't use `copy` in a name: it would match "Copy of wireframe" downloads.

The style guide goes in `docs/style-guide/` instead (that is `/theme`'s input);
`/schema` and `/section` ignore that folder.

## Screenshot naming

**One screenshot per section**, named:

```
NN-<page-slug>-page-<section-name>.ext
```

```
01-home-page-landing-hero.png     02-home-page-intro.png
01-about-page-story.png           02-about-page-team.png
01-agendas-minutes-page-documents.png
```

| Part | Rule |
|---|---|
| `NN` | Two digits. **Restarts per page.** Sets the section's order on that page, top to bottom. Insert a section = renumber one page, not the whole site. |
| `-page-` | **Required**, and the divider. The page slug is everything before the first `-page-`, the section name everything after. So a slug can't contain the word "page" (use `landing`, not `landing-page`). |
| `<page-slug>` | Picks the page and schema type: `home` → `/` + `homePage`; `agendas-minutes` → `/agendas-minutes` + `agendasMinutesPage`. |
| `<section-name>` | Becomes the schema group (`landing-hero` → `landingHero`), the component (`<LandingHero/>`), and the `/section` argument (`/section home landing-hero`). |
| ext | `png`, `jpg`, `jpeg` or `webp`. |

Rules enforced by `npm run docs` (and by `/schema`):

- A screenshot that doesn't match the pattern is reported, not guessed at.
- Section names must be **unique per page**.
- A section can't be named `title` or `seo` (they collide with schema fields).
- Screenshots must not contain Figma comment pins (numbered circles) or other
  annotation UI. `/schema` flags them and leaves them out.

`/section` also takes a loose section name: `/section home hero` finds
`landing-hero` when it's the only match. If it's ambiguous it lists the page's
sections.

## Seed files: the copy that goes into Sanity

`docs/seed/` holds the page copy as JSON, and `npm run seed` writes it into Sanity
as real, **published** documents. (`initialValue` only pre-fills a form when a
document is first created in Studio, and someone still has to open and publish
every page. Seeding fixes both.) `/schema` writes the files in Phase 1, from the
Figma design (content draft where Figma shows placeholder text). By hand: fill
them in yourself and run the same script.

```
docs/seed/home.json            a page singleton, named by page slug (home -> homePage)
docs/seed/navigation.json      any other singleton: add "_type": "navigation"
docs/seed/testimonials.json    a top-level array = a list of documents, each with
                               "_type" and a stable "_id"
```

Keys are the schema's field names. Paragraph arrays are JSON arrays of strings,
CTAs are `{ "label", "url" }`, and arrays of objects get a stable `_key` added.
Missing copy: **leave the key out** (never `""`, never lorem ipsum) and add a
`"_todo": "..."` note: any key starting with `_` (other than `_type`, `_id`,
`_key`, `_ref`) is a note that the seed ignores but lists. Full shape and examples:
`.claude/skills/schema/seed.md`. `npm run seed -- --init <slug>` writes a skeleton
for a page.

### Running it (Git Bash, from the client folder)

```bash
npm run seed -- --init home              # skeleton from the screenshot sections (never overwrites)
npm run seed -- --dry-run --offline      # check the files: no network, no token
npm run seed -- --dry-run                # read Sanity, show exactly what would be written
npm run seed                             # write it
npm run seed -- home about               # only those files
npm run seed -- --force                  # overwrite the fields in the files (asks nothing: be sure)
```

Put `--dry-run` first when combining flags. It reads the project ID, dataset and
`SANITY_API_TOKEN` from `.env.local` itself and never prints the token.

**Safe by default.** It only fills what is empty and never overwrites an edit made
in Studio. A field is empty if it is missing, blank, `[]`, or an object with
nothing in it. An array that already has anything in it is left alone entirely.
If a document has an unpublished **draft** in Studio, the draft's empty fields are
filled too (so Studio's draft doesn't hide the seeded copy), and the output lists
every draft it touched: those show as unpublished changes until you publish or
discard them. `--force` overwrites the fields present in the file (never deletes
others). **Images are skipped** in this version: `{ "$image": "..." }` markers
are counted and listed, and the image slots are filled in Studio. Re-running is
safe: once everything is filled, a dry run says "nothing to do", which is also how
to check whether the copy is in Sanity.

## Who reads what

| Command | Reads |
|---|---|
| `/theme` | `docs/style-guide/` screenshots → `docs/style-guide/tokens.json` |
| `/schema` | **the Figma design** (every page screenshot, one schema group per screenshot, in order); optional: overview, wireframe, content drafts, design brief. Writes `docs/seed/`. |
| `npm run seed` | `docs/seed/*.json` (and `.env.local`) |
| `/section` | the one screenshot for the section; optional: the design brief |
| `/promote` | nothing here |

## Rules

- The Figma design is the final design. When any optional doc disagrees with it
  (structure, order, copy), Figma wins and `/schema` reports the difference.
- Client data in here is the client's. Don't copy it into the starter;
  `/promote` strips it.
- Keep the folder in the client repo so the build is reproducible from one
  clone. Large images are fine; export at 1x if the repo gets heavy.
