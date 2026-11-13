# Latz Starter

The base for every Latz Web Design client site: one Next.js app with the Sanity Studio built in at `/latz-studio`.

Each client gets their own copy of this repo, their own Sanity organization and project, and owns all of it. This repo is the template. You don't deploy it.

| | |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack), React 19 |
| CMS | Sanity 6, embedded at `/latz-studio` via next-sanity 13 |
| Styling | Tailwind CSS 3.4, Framer Motion 12 |
| Email | Resend + React Email |
| Hosting | Vercel |
| Language | JavaScript only (`.js`, never `.ts`) |

Every dependency is pinned to an exact version (`.npmrc` has `save-exact=true`). Upgrades are deliberate: bump, test, note it in `CHANGELOG.md`.

---

## Requirements

- **Node.js 22.12 or newer**, locally and on Vercel. Sanity 6 won't install on anything older. `package.json` declares `"engines": { "node": ">=22.12" }`.
  - Check yours: `node -v`
  - **Vercel note:** Vercel reads `engines.node` and, for an open range like `>=22.12`, builds on the **newest** Node it offers (Node 26 as of Nov 2026), not the version you have locally. To make Vercel match a local Node 22 exactly, change it to `"22.x"` in that client's `package.json`.
- **git**
- **A Sanity account** (the new-client script logs you in if needed)
- A local clone of this repo, kept up to date (`git pull`). The new-client script copies from it.

---

## Start a new client

### 1. Run the script

From your local clone of the starter:

```bash
npm run new-client -- --name "Acme Cleaning Co" --domain acmecleaning.com
```

It creates `../acme-cleaning-co/` next to the starter and:

1. Copies the starter's **committed** files (uncommitted changes are not copied, it warns you)
2. Sets the client name in `package.json`, `sanity/branding.js` and `data/config/contact.js`, and records the starter version in `package.json` under `latzStarter`
3. Runs `npm ci`
4. In Sanity: creates a **new organization** named after the client, a **project** with a public `production` dataset, CORS origins for `http://localhost:3000` (plus `https://acmecleaning.com` and `https://www.acmecleaning.com` if you passed `--domain`), and two API tokens (viewer + editor)
5. Writes `.env.local` with the project ID, dataset and both tokens
6. Runs `git init` and makes the first commit on `main`. Nothing is pushed.

| Option | |
|---|---|
| `--name "Client Name"` | Required |
| `--domain example.com` | Live domain. Adds it to CORS and sets `NEXT_PUBLIC_SITE_URL` |
| `--dir path` | Target folder. Default `../<client-slug>` |
| `--org <orgId>` | Use an existing Sanity organization instead of creating one |
| `--skip-sanity` | Copy, install and commit only. The site runs on placeholder content |
| `--skip-install` | Skip `npm ci` (also skips Sanity, which needs it) |

### 2. Check it boots

```bash
cd ../acme-cleaning-co
npm run dev
```

- `http://localhost:3000`: the site, with placeholder content
- `http://localhost:3000/latz-studio`: the Studio. Log in with your Sanity account.

### 3. Fill in the rest of `.env.local`

- `RESEND_API_KEY`: the Latz Resend key
- `CLIENT_EMAIL`: the inbox that gets new-inquiry emails

### 4. GitHub + Vercel

1. Create the client's GitHub repo, then `git remote add origin <url> && git push -u origin main`
2. Import the repo in Vercel
3. Copy **every** value from `.env.local` into Vercel → Settings → Environment Variables (Production and Preview). `NEXT_PUBLIC_*` values are baked in at build time, so redeploy after adding them.

### 5. Live domain in Sanity CORS

The embedded Studio only works on origins listed in the project's CORS settings, with **Allow credentials** on. If you didn't pass `--domain`, add it once the domain is known:

```bash
npx sanity cors add https://clientdomain.com --credentials
npx sanity cors add https://www.clientdomain.com --credentials
```

(or sanity.io/manage → project → API → CORS origins → Add, check "Allow credentials")

**Vercel preview URLs:** don't add a wildcard like `https://*.vercel.app`. The Sanity CLI warns it's risky: it would let any Vercel site make logged-in requests to the project. If you need the Studio on a specific preview, add that exact URL, and remove it afterwards.

### 6. Invite the client

sanity.io/manage → the client's organization → project → **Members** → Invite. Give them the **Editor** role (or Administrator if they should manage members themselves). They log in at `clientdomain.com/latz-studio` with Google, GitHub or email.

When the project is handed over, transfer billing/ownership of the client's Sanity organization to them in sanity.io/manage.

### 7. Per-client setup

The home page shows a setup checklist (`components/design/ProjectChecklist.js`) until you remove it. The short version:

- Theme `tailwind.config.js` + `globals.css` (fonts in `app/layout.js`, keep the `--font-heading` variable)
- `sanity/branding.js`: Studio logo (`logoUrl`) and CMS guide URL
- `public/cms-guide.html`: replace the placeholder with the client's editing guide (keep its `noindex` meta tag)
- `data/config/contact.js`: form fields, colors, email copy
- `data/config/redirects.mjs`: old URLs, for rebuilds
- Studio → SEO Settings: fill it in, including Site URL (must match `NEXT_PUBLIC_SITE_URL`) and Email Logo

---

## How it's put together

```
app/
  layout.js                  minimal root: <html>/<body> + font variable
  not-found.js               404, wrapped in SiteShell so it keeps nav/footer
  (site)/                    every public page; the route group adds nothing to URLs
    layout.js                globals.css, site metadata, SiteShell
    page.js  about/  services/  contact/  legal/  design/
  latz-studio/[[...tool]]/   the embedded Studio (no site layout, no Tailwind)
  api/draft-mode/            enable/disable, used by the Presentation tool
pages/api/submitContactForm.js
sanity/
  env.js                     project ID, dataset, API version, studio path
  branding.js                PER CLIENT: Studio title, logo, CMS guide URL, colors
  schemaTypes/               document schemas
  structure.js               Studio sidebar + singleton rules
  presentation.js            which route shows which document (live preview)
  components/                Studio footer/help popup, logo, "not connected" screen
sanity.config.js             Studio config (basePath /latz-studio)
sanity.cli.js                lets `npx sanity ...` find the project
components/  data/  utils/  lib/  emails/
proxy.js                     noindex headers (Next 16's name for middleware.js)
scripts/new-client.mjs       removed from client copies
```

### Runs without Sanity

With no `NEXT_PUBLIC_SANITY_PROJECT_ID`, the site builds and runs on placeholder content: `fetchContent` and `fetchSeoSettings` return `null`, the nav uses `PLACEHOLDER_NAV_LINKS`, and `/latz-studio` shows a "not connected" screen. The contact form still validates and responds, it just doesn't email or store anything.

### Sanity access

| Where | Token | Used for |
|---|---|---|
| Normal page reads | none | Published content (public dataset) |
| Draft mode | `SANITY_VIEWER_TOKEN` (viewer) | Presentation tool previews |
| Contact form API | `SANITY_API_TOKEN` (editor) | Writing submissions |

Both tokens are server-only (no `NEXT_PUBLIC_`).

### Presentation tool (live preview)

Studio → **Live Preview** loads the site's own pages in draft mode, side by side with the editor. Text from Sanity gets click-to-edit overlays (stega encoding, draft mode only). Add each new page to `PAGES` in `sanity/presentation.js` so the Studio knows which document a route shows.

Stega adds invisible characters to strings in draft mode. If you compare a CMS string in code (`if (style === 'dark')`), wrap it: `stegaClean(style)` from `next-sanity`. Metadata, footer contact links and emails already use clean values.

### Not indexed

`/latz-studio`, `/design`, `/cms-guide.html` and `/api` get an `X-Robots-Tag: noindex` header (`proxy.js`), are excluded from the sitemap and disallowed in `robots.txt` (`next-sitemap.config.js`). Every `*.vercel.app` and `*.latzwebdesign.com` host is noindexed entirely.

### SVGs

```js
import Logo from './logo.svg';          // React component (SVGR)
import logoUrl from './logo.svg?url';   // static file: use logoUrl.src
```

### Redirects

Add old → new URLs to `data/config/redirects.mjs`. They're wired into `next.config.mjs`.

---

## Commands

| | |
|---|---|
| `npm run dev` | Dev server on :3000 (site + Studio) |
| `npm run build` | Production build, then sitemap/robots generation |
| `npm run lint` | ESLint (`eslint .`, Next 16 dropped `next lint`) |
| `npm run email:dev` | React Email preview on :3001 |
| `npm run new-client -- --name "..."` | Starter only: create a client project |

---

## Changing the starter

1. Make the change on a branch, run `npm run build` and `npm run lint`
2. Bump `version` in `package.json` (patch for fixes, minor for new features, major for anything that breaks existing client code)
3. Add an entry to `CHANGELOG.md`
4. Merge to `main`

Client projects record the starter version they began from in `package.json` → `latzStarter`. Fixes don't flow to existing clients automatically.
