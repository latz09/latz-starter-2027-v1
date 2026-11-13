#!/usr/bin/env node
// scripts/docs-index.mjs  (npm run docs)
// Shows what /schema and /section will see in docs/: the source docs it found,
// the pages and their sections in order (with the schema group and component
// name each screenshot maps to), and any screenshots whose names don't match
// the convention. Pure Node, read-only.
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

const { sources, pages, problems, notes } = readDocs(DOCS);

if (JSON_OUT) {
	const out = {
		sources: Object.fromEntries(
			Object.entries(sources).map(([k, v]) => [k, v ? path.relative(ROOT, v) : null]),
		),
		pages: pages.map((pg) => ({
			slug: pg.slug,
			route: pageRoute(pg.slug),
			type: pageType(pg.slug),
			query: pageQueryName(pg.slug),
			sections: pg.sections.map((s) => ({ order: s.num, section: s.section, group: s.group, component: s.component, file: s.file })),
		})),
		problems,
		notes,
	};
	console.log(JSON.stringify(out, null, 2));
	process.exit(problems.length ? 1 : 0);
}

console.log(c.bold('\nSource docs'));
for (const [k, v] of Object.entries(sources)) {
	console.log(`  ${v ? c.green('✓') : c.yellow('–')} ${k.padEnd(10)} ${v ? path.relative(ROOT, v) : c.dim('not found')}`);
}

console.log(c.bold(`\nPages (${pages.length})`));
if (!pages.length) console.log(c.dim('  no page screenshots found'));
for (const pg of pages) {
	console.log(`  ${c.bold(pg.slug)}  ${c.dim(`${pageRoute(pg.slug)} · ${pageType(pg.slug)}`)}`);
	for (const s of pg.sections) {
		console.log(`    ${String(s.num).padStart(2, '0')}  ${s.section.padEnd(24)} ${c.dim(`group ${s.group} · <${s.component}/>`)}`);
	}
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
