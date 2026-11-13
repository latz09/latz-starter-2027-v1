# Seed files

Read before writing `docs/seed/`. `npm run seed` writes these files into Sanity as
real, published documents. Phase 1 of `/schema` writes them from the Figma design
(content draft as the fallback); Jordan runs the seed after Phase 3.

## Where and which file

```
docs/seed/<page-slug>.json     a page singleton: home.json -> homePage, _id homePage
docs/seed/navigation.json      any other singleton: needs "_type" ("_id" defaults to the type)
docs/seed/<anything>.json      a TOP-LEVEL ARRAY = list of documents (collection items):
                               each needs "_type" and a stable "_id"
```

Files starting with `_` are ignored. `npm run seed -- --init <slug>` writes a page
skeleton (title, one empty group per screenshot, empty seo) and never overwrites.

## Shape: keys are the schema's field names, nothing else

Walk the schema file you just wrote field by field. A key that is not in the
schema is reported and not written. Types must match the schema (the seed cannot
check that): a paragraph array is an array, a single `text` field is a string.

```json
{
  "title": "Home",
  "landingHero": {
    "headline": "Roofs that last",
    "intro": ["Paragraph one.", "Paragraph two."],
    "cta": { "label": "Get a quote", "url": "/contact" },
    "heroImages": [
      { "alt": "Crew on a roof", "image": { "$image": "docs/seed/images/hero-1.jpg" } }
    ],
    "_todo": "confirm the phone number with the client"
  },
  "seo": { "title": "Roofing in Stevens Point", "description": "..." }
}
```

| Thing | How |
|---|---|
| Paragraph arrays | A plain JSON array of strings (`of: [{ type: 'text' }]`). Never one string with `\n\n`. |
| CTAs | A plain `{ "label", "url" }` object. A fixed-destination CTA has only `label`. |
| Arrays of objects | Plain objects. The seed adds a deterministic `_key` to each, so re-running never duplicates. |
| Image arrays | `{ "alt": "...", "image": { "$image": "<path or url>" } }`. The alt text seeds; the image is skipped. |
| A single image field | `{ "$image": "<path or url>" }`, or leave it out. Skipped in this version. |
| Slug | `{ "current": "our-story" }` (the seed adds `_type: "slug"`). |
| Reference | `{ "_ref": "<document _id>" }` (the seed adds `_type: "reference"`). |
| Rich text | Not used. Our conventions use paragraph arrays. |
| Missing copy | **Omit the key.** Never `""`, never lorem ipsum. Add a `_todo` note so the gap shows up. |
| Notes | Any other key starting with `_` (`_todo`, `_note`) is a note: ignored by the seed, listed in its output. |

## Copy priority

Final copy visible in the Figma design, then the content draft where Figma shows
placeholder text, otherwise omit it and add a `_todo`. Figma comment pins are not
copy. Where a content draft and Figma disagree, Figma wins (and the analysis
already listed the difference).

## What the seed does with them

Fill-empty by default: it writes a field only if the document's field is empty,
arrays that already have anything in them are never touched, and edits made in
Studio are never overwritten. It also fills empty fields in an existing Studio
draft and says which drafts it touched. `--force` overwrites the fields in the
file (Jordan's decision, never yours). Images are counted and skipped.

Always `npm run seed -- --dry-run ...` first (the allow rule matches
`--dry-run` first). Claude runs only dry-runs: `npm run seed -- --dry-run --offline`
checks the files with no network or token. A real seed is Jordan's step.
