#!/usr/bin/env node
// scripts/remove-page.mjs  (npm run remove-page -- <slug>)
// Reverses new-page: deletes the page's schema, query, page file/route and its
// section components, and de-registers it from schemaTypes/index.js,
// sanity/structure.js and sanity/presentation.js. Does NOT touch navigation
// content. Pure Node. Use when the design drops a starter page (home, about,
// services, contact) or to undo a scaffolded one.
//
//   npm run remove-page -- services
//   npm run remove-page -- services --dry-run
//
// /schema calls this (after confirming with Jordan) for pages the design cuts.

import { readFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, c, step, ok, warn, info, fail } from './lib/args.mjs';
import { readText, writeText } from './lib/text.mjs';
import { slugify, pageType, toPascal, pageQueryName } from './lib/names.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (rel) => path.join(ROOT, rel);

const args = parseArgs(process.argv.slice(2));
const DRY = !!args['dry-run'];
const slug = slugify(args._[0] || '');
if (!slug) fail('Usage: npm run remove-page -- <slug> [--dry-run]');

guardStarter();

const type = pageType(slug);
const queryName = pageQueryName(slug);
const pageFolder = slug === 'home' ? 'Home' : toPascal(slug);
const targets = [
	`sanity/schemaTypes/${type}.js`,
	`data/queries/pages/${queryName}.js`,
	slug === 'home' ? 'app/(site)/page.js' : `app/(site)/${slug}`,
	`components/sections/${pageFolder}`,
];

step('remove-page', `${c.bold(slug)}  ${c.dim(type)}`);
const pending = [];

for (const rel of targets) {
	if (existsSync(P(rel))) pending.push([`delete ${rel}`, () => rmSync(P(rel), { recursive: true, force: true })]);
}

editBarrel();
editStructure();
editPresentation();

if (!pending.length) {
	info('Nothing to remove; page not found.');
} else if (DRY) {
	for (const [label] of pending) info(`would ${label}`);
} else {
	for (const [label, fn] of pending) {
		fn();
		ok(label);
	}
	warn('Navigation content is not touched. Remove this page from the navigation document / initialValue if needed.');
}
console.log('');

// ════════════════════════════════════════════════════════════════════════════

function queueEdit(rel, label, transform) {
	if (!existsSync(P(rel))) return;
	const { text, eol } = readText(P(rel));
	const next = transform(text);
	if (next == null || next === text) return;
	pending.push([label, () => writeText(P(rel), next, eol)]);
}

function editBarrel() {
	queueEdit('sanity/schemaTypes/index.js', `de-register ${type} in schemaTypes/index.js`, (text) =>
		text
			.split('\n')
			.filter((l) => !new RegExp(`^import ${type} from `).test(l) && l.trim() !== `${type},`)
			.join('\n'),
	);
}

function editStructure() {
	queueEdit('sanity/structure.js', `de-register ${type} in structure.js`, (text) => {
		let lines = text.split('\n');
		// Remove the sidebar listItem block (back from the .child line to S.listItem()).
		const childIdx = lines.findIndex((l) => l.includes(`schemaType('${type}')`));
		let removedIcon = null;
		if (childIdx !== -1) {
			let start = childIdx;
			while (start > 0 && !lines[start].includes('S.listItem()')) start--;
			for (let i = start; i <= childIdx; i++) {
				const m = lines[i].match(/\.icon\((\w+Icon)\)/);
				if (m) removedIcon = m[1];
			}
			lines.splice(start, childIdx - start + 1);
		}
		// Remove the singletonTypes entry.
		lines = lines.filter((l) => l.trim() !== `'${type}',`);
		// Remove the icon import if nothing else uses that icon now.
		if (removedIcon && !lines.some((l) => !l.includes('import') && l.includes(removedIcon))) {
			lines = lines.filter((l) => !(l.includes('import') && l.includes(`{ ${removedIcon} }`)));
		}
		return lines.join('\n');
	});
}

function editPresentation() {
	queueEdit('sanity/presentation.js', `de-register ${type} in presentation.js`, (text) =>
		text
			.split('\n')
			.filter((l) => !new RegExp(`type: '${type}'`).test(l))
			.join('\n'),
	);
}

function guardStarter() {
	try {
		const pkg = JSON.parse(readFileSync(P('package.json'), 'utf8'));
		if (pkg.name === 'latz-starter') fail('remove-page is for client projects. This is the starter.');
	} catch (e) {
		if (/starter/.test(e.message)) throw e;
	}
}
