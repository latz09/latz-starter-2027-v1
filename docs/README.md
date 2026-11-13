# docs/

Per-client source material. Claude Code commands read from here, so nothing gets pasted into chat.

This folder is empty in the starter. Fill it at the start of each client build.

## What goes here

| File | What it is | Where it comes from |
|---|---|---|
| `overview.html` | Project overview: scope, pages, collections, client context | Overview generator (chat) |
| `wireframe.html` | Page structure, content blocks, CMS vs hardcoded decisions | Wireframe generator (chat) |
| `design-brief.html` | Design direction and decisions | Design brief generator (chat) |
| `<slug>.png` | Page screenshots from Figma, named by page slug | Figma export |

Export the three HTML docs from the chat generators and save them with those exact names. `.md` or `.pdf` also works if that is what you have: keep the base name.

## Screenshot naming

One file per page, named after the URL slug:

```
home.png        about.png        contact.png        agendas-minutes.png
```

Long pages that need several screenshots: number them in page order.

```
home-1.png      home-2.png       home-3.png
```

A named variant also works (`home-hero.png`, `home-services.png`), but numbers are better because they keep the top-to-bottom order.

Screenshots must not contain Figma comment pins (numbered circles) or other annotation UI. If they do, `/schema` flags them and leaves them out of the schema.

## Who reads what

| Command | Reads |
|---|---|
| `/schema` | overview, wireframe, every screenshot |
| `/section` | the screenshot for the page the section is on, plus the design brief |
| `/promote` | nothing here |

## Rules

- Screenshots are the final design. When a wireframe and a screenshot disagree on structure, the screenshot wins. The wireframe still wins on behavior (CMS vs hardcoded, filtering, collection relationships).
- Client data in here is the client's. Do not copy it into the starter. `/promote` strips it.
- Keep the folder in the client repo so the whole build is reproducible from one clone. Large image files are fine; if the repo gets heavy, export at 1x.
