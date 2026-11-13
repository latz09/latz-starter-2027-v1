# Button Kits

Reference library of the button behaviors used across past client projects.
This exists so a new project starts by *picking*, not *rebuilding*.

## The kits

| File                              | Behavior                                                              |
|------------------------------------|-------------------------------------------------------------------------|
| `ButtonLink.1-no-arrow.js`         | Background/text color swap on hover. No arrow. (Current starter default.) |
| `ButtonLink.2-swap-side.js`        | Arrow swaps sides on hover (right arrow slides out, left arrow slides in). CSS-only, no JS state. |
| `ButtonLink.3-grow-line.js`        | Arrowhead stays put, the line behind it stretches on hover. Label goes italic. |
| `ButtonLink.4-spread.js`           | Full-width, bordered, label/arrow pushed to opposite ends. For standalone CTA banners. |

## Workflow for a new project

1. Run the app locally and open `/design/buttons` — every kit is rendered
   live with real hover states, on both light and dark backgrounds.
2. Compare against the designer's mockup and pick the closest match.
3. Copy the winning file's contents into `components/ui/ButtonLink.js`
   (overwrite the default).
4. Retheme: swap the placeholder `primary` / `secondary` / `dark` / `light`
   / `accent` classes in that file's `VARIANTS` object for the client's
   actual Tailwind color tokens.
5. Delete this `button-kits/` folder and `app/design/buttons/` — they're
   scaffolding, not part of the shipped site.

## If none of them match

Tweak the closest one rather than starting from scratch — usually it's
just the arrow SVG path or the transition timing that differs. If a
genuinely new pattern shows up more than once across projects, add it
here as Kit 5.
