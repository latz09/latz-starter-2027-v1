// scripts/lib/docs.mjs
// Reads the per-client docs/ folder: the source docs (overview, wireframe,
// design brief, matched loosely by keyword) and the page screenshots, named
//
//   NN-<page-slug>-page-<section-name>.ext
//   01-home-page-landing-hero.png   02-home-page-intro.png
//
// NN restarts per page and sets section order. <page-slug> picks the page and
// schema type; <section-name> becomes the schema group (landingHero), the
// component (<LandingHero/>) and the /section argument. docs/style-guide/ is
// ignored (that is /theme's folder). Used by docs-index.mjs, /schema, /section.

import { readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';
import { sectionGroup, sectionComponent, toPascal, RESERVED_SECTIONS } from './names.mjs';

const IMAGE_RE = /\.(png|jpe?g|webp)$/i;
// NN-<slug>-page-<section>.ext  — slug and section are lowercase, hyphenated.
const SHOT_RE = /^(\d{2,})-([a-z0-9]+(?:-[a-z0-9]+)*)-page-([a-z0-9]+(?:-[a-z0-9]+)*)\.(png|jpe?g|webp)$/i;
const SOURCE_KEYS = { overview: /overview/i, wireframe: /wireframe/i, brief: /brief/i };
const SOURCE_EXT = /\.(html?|md|txt|pdf)$/i;

// Read docs/ and return { sources, pages, problems, notes }.
//   sources: { overview, wireframe, brief } -> absolute path or null
//   pages:   [{ slug, sections: [{ num, section, file, group, component }] }]
//            pages ordered home-first then alphabetical; sections by num.
export function readDocs(docsDir) {
	const problems = [];
	const notes = [];
	if (!existsSync(docsDir)) {
		return { sources: { overview: null, wireframe: null, brief: null }, pages: [], problems: ['docs/ folder not found'], notes };
	}

	const entries = readdirSync(docsDir, { withFileTypes: true })
		.filter((e) => e.isFile())
		.map((e) => e.name);

	// ── Source docs: keyword match, newest wins on a tie ──────────────────────
	const sources = { overview: null, wireframe: null, brief: null };
	for (const key of Object.keys(SOURCE_KEYS)) {
		const matches = entries
			.filter((n) => SOURCE_EXT.test(n) && SOURCE_KEYS[key].test(n))
			.map((n) => ({ n, mtime: statSync(path.join(docsDir, n)).mtimeMs }))
			.sort((a, b) => b.mtime - a.mtime);
		if (matches.length) {
			sources[key] = path.join(docsDir, matches[0].n);
			if (matches.length > 1) notes.push(`${matches.length} files match "${key}"; using newest: ${matches[0].n}`);
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

	return { sources, pages, problems, notes };
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
