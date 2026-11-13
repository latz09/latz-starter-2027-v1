// scripts/lib/docs.mjs
// Reads the per-client docs/ folder: the Figma design (the page screenshots,
// the one required input) and the optional background docs (overview,
// wireframe, content draft, design brief, matched loosely by keyword). Also
// reports the seed files in docs/seed/. Screenshots are named
//
//   NN-<page-slug>-page-<section-name>.ext
//   01-home-page-landing-hero.png   02-home-page-intro.png
//
// NN restarts per page and sets section order. <page-slug> picks the page and
// schema type; <section-name> becomes the schema group (landingHero), the
// component (<LandingHero/>) and the /section argument. docs/style-guide/ is
// ignored (that is /theme's folder), and so is docs/seed/ (the files npm run
// seed writes into Sanity). Used by docs-index.mjs, /schema, /section, seed.

import { readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { sectionGroup, sectionComponent, toPascal, RESERVED_SECTIONS } from './names.mjs';

const IMAGE_RE = /\.(png|jpe?g|webp)$/i;
// NN-<slug>-page-<section>.ext  — slug and section are lowercase, hyphenated.
const SHOT_RE = /^(\d{2,})-([a-z0-9]+(?:-[a-z0-9]+)*)-page-([a-z0-9]+(?:-[a-z0-9]+)*)\.(png|jpe?g|webp)$/i;
// Order matters: a file is assigned to the FIRST key it matches, so the more
// specific "content" wins ("wireframe-content-draft.html" is a content draft).
// Only overview/wireframe/brief keep a single newest file; content drafts keep
// all matches (a designer may hand over one per page).
const SOURCE_KEYS = { content: /content/i, overview: /overview/i, wireframe: /wireframe/i, brief: /brief/i };
const MULTI_KEYS = new Set(['content']);
const SOURCE_EXT = /\.(html?|md|txt|pdf)$/i;

// Read docs/ and return { sources, pages, seed, problems, notes }.
//   sources: { overview, wireframe, brief } -> absolute path or null,
//            content -> [absolute paths] (newest first, may be empty)
//   pages:   [{ slug, sections: [{ num, section, file, group, component }] }]
//            pages ordered home-first then alphabetical; sections by num.
//   seed:    [{ file, name, slug|null }] the *.json files in docs/seed/
//            (slug is set when the file name is a page slug in `pages`)
export function readDocs(docsDir) {
	const problems = [];
	const notes = [];
	const emptySources = { overview: null, wireframe: null, brief: null, content: [] };
	if (!existsSync(docsDir)) {
		return { sources: emptySources, pages: [], seed: [], problems: ['docs/ folder not found'], notes };
	}

	const entries = readdirSync(docsDir, { withFileTypes: true })
		.filter((e) => e.isFile())
		.map((e) => e.name);

	// ── Optional background docs: keyword match ───────────────────────────────
	// Each file goes to the first key it matches. Newest wins per key, except
	// the multi keys (content drafts), which keep every match, newest first.
	const sources = { ...emptySources };
	const claimed = new Map(); // key -> [{ n, mtime }]
	for (const n of entries) {
		if (!SOURCE_EXT.test(n)) continue;
		const key = Object.keys(SOURCE_KEYS).find((k) => SOURCE_KEYS[k].test(n));
		if (!key) continue;
		if (!claimed.has(key)) claimed.set(key, []);
		claimed.get(key).push({ n, mtime: statSync(path.join(docsDir, n)).mtimeMs });
	}
	for (const [key, list] of claimed) {
		list.sort((a, b) => b.mtime - a.mtime || a.n.localeCompare(b.n));
		if (MULTI_KEYS.has(key)) {
			sources[key] = list.map((m) => path.join(docsDir, m.n));
		} else {
			sources[key] = path.join(docsDir, list[0].n);
			if (list.length > 1) notes.push(`${list.length} files match "${key}"; using newest: ${list[0].n}`);
		}
	}

	// ── Screenshots ───────────────────────────────────────────────────────────
	const byPage = new Map();
	for (const name of entries) {
		if (!IMAGE_RE.test(name)) continue;
		const m = name.match(SHOT_RE);
		if (!m) {
			problems.push(`${name}: does not match NN-<slug>-page-<section>.ext (e.g. 01-home-page-landing-hero.png)`);
			continue;
		}
		const num = parseInt(m[1], 10);
		const slug = m[2].toLowerCase();
		const section = m[3].toLowerCase();
		if (RESERVED_SECTIONS.has(section)) {
			problems.push(`${name}: section "${section}" is reserved (collides with the schema's ${section} field). Rename the section.`);
			continue;
		}
		if (!byPage.has(slug)) byPage.set(slug, []);
		byPage.get(slug).push({ num, section, file: name });
	}

	// Order, derive names, catch duplicate section names per page.
	const pages = [];
	for (const [slug, shots] of byPage) {
		shots.sort((a, b) => a.num - b.num || a.section.localeCompare(b.section));
		const seen = new Map();
		const sections = shots.map((s) => {
			if (seen.has(s.section)) {
				problems.push(`${slug}: section "${s.section}" appears twice (${seen.get(s.section)} and ${s.file}). Section names must be unique per page.`);
			}
			seen.set(s.section, s.file);
			return {
				num: s.num,
				section: s.section,
				file: s.file,
				group: sectionGroup(s.section),
				component: sectionComponent(s.section),
			};
		});
		pages.push({ slug, sections });
	}
	pages.sort((a, b) => (a.slug === 'home' ? -1 : b.slug === 'home' ? 1 : a.slug.localeCompare(b.slug)));

	// ── Seed files (docs/seed/*.json) ─────────────────────────────────────────
	const seed = [];
	const seedDir = path.join(docsDir, 'seed');
	if (existsSync(seedDir)) {
		for (const e of readdirSync(seedDir, { withFileTypes: true })) {
			if (!e.isFile() || !/\.json$/i.test(e.name) || e.name.startsWith('_')) continue;
			const name = e.name.replace(/\.json$/i, '');
			seed.push({ file: path.join(seedDir, e.name), name, slug: pages.some((p) => p.slug === name) ? name : null });
		}
		seed.sort((a, b) => a.name.localeCompare(b.name));
	}

	return { sources, pages, seed, problems, notes };
}

// Find a section on a page, loosely: exact slug, else the only section whose
// name ends with or contains the query. Returns { section } or { candidates }.
export function findSection(pages, slug, query) {
	const page = pages.find((p) => p.slug === slug);
	if (!page) return { error: `no screenshots for page "${slug}"`, candidates: pages.map((p) => p.slug) };
	const q = String(query).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
	const exact = page.sections.find((s) => s.section === q);
	if (exact) return { section: exact };
	const loose = page.sections.filter((s) => s.section.endsWith(q) || s.section.includes(q));
	if (loose.length === 1) return { section: loose[0] };
	return { error: loose.length ? `"${query}" is ambiguous on ${slug}` : `no section matching "${query}" on ${slug}`, candidates: page.sections.map((s) => s.section) };
}

export { toPascal };
