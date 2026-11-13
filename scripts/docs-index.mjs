#!/usr/bin/env node
// scripts/docs-index.mjs  (npm run docs)
// Shows what /schema and /section will see in docs/: the Figma design (the page
// screenshots, required: pages and sections in order, with the schema group and
// component name each maps to), the optional background docs it found (overview,
// wireframe, content draft, design brief), the seed files in docs/seed/, and any
// screenshots whose names don't match the convention. Pure Node, read-only.
//
//   npm run docs            human-readable
//   npm run docs -- --json  machine-readable (skills read this)

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDocs } from './lib/docs.mjs';
import { pageType, pageRoute, pageQueryName } from './lib/names.mjs';
import { c } from './lib/args.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS = path.join(ROOT, 'docs');
const JSON_OUT = process.argv.includes('--json');

const { sources, pages, seed, problems, notes } = readDocs(DOCS);
const rel = (f) => path.relative(ROOT, f).split(path.sep).join('/');

if (JSON_OUT) {
	const out = {
		// Optional background docs. content is a list (every content draft found).
		sources: Object.fromEntries(
			Object.entries(sources).map(([k, v]) => [k, Array.isArray(v) ? v.map(rel) : v ? rel(v) : null]),
		),
		pages: pages.map((pg) => ({
			slug: pg.slug,
			route: pageRoute(pg.slug),
			type: pageType(pg.slug),
			query: pageQueryName(pg.slug),
			sections: pg.sections.map((s) => ({ order: s.num, section: s.section, group: s.group, component: s.component, file: s.file })),
			seedFile: seed.find((f) => f.slug === pg.slug) ? rel(seed.find((f) => f.slug === pg.slug).file) : null,
		})),
		seed: seed.map((f) => ({ name: f.name, file: rel(f.file), page: f.slug })),
		problems,
		notes,
	};
	console.log(JSON.stringify(out, null, 2));
	process.exit(problems.length ? 1 : 0);
}

console.log(c.bold('\nFigma design (required)'));
const shotCount = pages.reduce((n, p) => n + p.sections.length, 0);
console.log(shotCount
	? c.dim(`  today: the ${shotCount} screenshot(s) below. Figma wins wherever a doc disagrees.`)
	: c.yellow('  no page screenshots yet: /schema needs the Figma design (NN-<slug>-page-<section>.png) to run'));

console.log(c.bold('\nOptional background docs'));
for (const [k, v] of Object.entries(sources)) {
	const files = Array.isArray(v) ? v : v ? [v] : [];
	const label = k === 'content' ? 'content draft' : k;
	console.log(`  ${files.length ? c.green('✓') : c.yellow('–')} ${label.padEnd(14)} ${files.length ? files.map(rel).join(', ') : c.dim('not found (fine)')}`);
}

console.log(c.bold(`\nPages (${pages.length})`));
if (!pages.length) console.log(c.dim('  no page screenshots found'));
for (const pg of pages) {
	const hasSeed = seed.some((f) => f.slug === pg.slug);
	console.log(`  ${c.bold(pg.slug)}  ${c.dim(`${pageRoute(pg.slug)} · ${pageType(pg.slug)}`)}  ${hasSeed ? c.green('seed file ✓') : c.dim('no seed file')}`);
	for (const s of pg.sections) {
		console.log(`    ${String(s.num).padStart(2, '0')}  ${s.section.padEnd(24)} ${c.dim(`group ${s.group} · <${s.component}/>`)}`);
	}
}

if (seed.length) {
	console.log(c.bold(`\nSeed files (docs/seed/, ${seed.length})`));
	for (const f of seed) console.log(`  ${c.dim('·')} ${f.name}.json${f.slug ? '' : c.dim('  (not a page with screenshots: needs its own _type)')}`);
}

if (notes.length) {
	console.log(c.bold('\nNotes'));
	for (const n of notes) console.log(`  ${c.yellow('•')} ${n}`);
}
if (problems.length) {
	console.log(c.bold('\nProblems'));
	for (const pb of problems) console.log(`  ${c.red('✗')} ${pb}`);
	console.log('');
	process.exit(1);
}
console.log('');
