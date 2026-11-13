# docs/

Per-client source material. Claude Code commands read from here, so nothing
gets pasted into chat. This folder is empty in the starter. Fill it at the start
of each client build.

Run `npm run docs` any time to see exactly what `/schema` and `/section` will
read: the source docs found, every page and section in order, and any
screenshot whose name is wrong.

## What goes here

| File | What it is | From |
|---|---|---|
| `overview.html` | Scope, pages, collections, client context | Overview generator (chat) |
| `wireframe.html` | Page structure, CMS vs hardcoded decisions | Wireframe generator (chat) |
| `design-brief.html` | Design direction | Design brief generator (chat) |
| `NN-<slug>-page-<section>.png` | One screenshot per section (see below) | Figma export |

The three source docs are matched by keyword in the filename
(`overview`, `wireframe`, `brief`), case-insensitive, and can be `.html`, `.md`,
`.txt` or `.pdf`. So `updated-wireframe-with-pre-launch-page.html` still reads as
the wireframe. If two files match the same keyword, the newest is used.

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

## Who reads what

| Command | Reads |
|---|---|
| `/theme` | `docs/style-guide/` screenshots → `docs/style-guide/tokens.json` |
| `/schema` | overview, wireframe, every page screenshot (one schema group per screenshot, in order) |
| `/section` | the one screenshot for the section, plus the design brief |
| `/promote` | nothing here |

## Rules

- Screenshots are the final design. When a wireframe and a screenshot disagree
  on structure, the screenshot wins. The wireframe still wins on behavior (CMS
  vs hardcoded, filtering, collection relationships).
- Client data in here is the client's. Don't copy it into the starter;
  `/promote` strips it.
- Keep the folder in the client repo so the build is reproducible from one
  clone. Large images are fine; export at 1x if the repo gets heavy.
