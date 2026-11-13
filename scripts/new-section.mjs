#!/usr/bin/env node
// scripts/new-section.mjs  (npm run new-section -- <page> <section>)
// Scaffolds one section component and wires it into the page, so /section only
// has to build the real markup. Creates components/sections/<Page>/<Comp>.js
// (Section wrapper + props), imports it into the page file, and places
// <Comp /> before </PageContainer>. Idempotent. Pure Node.
//
//   npm run new-section -- home landing-hero
//   npm run new-section -- home hero          (loose: matches landing-hero)
//
// /section calls this for the boilerplate, then builds the real component and
// wires the real spread props + data destructuring (see CLAUDE.md).

import { readFileSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, c, step, ok, warn, info, fail } from './lib/args.mjs';
import { readText, writeText, insertAfterLast, insertBeforeFirst } from './lib/text.mjs';
import { slugify, toPascal, sectionGroup, sectionComponent, RESERVED_SECTIONS } from './lib/names.mjs';
import { readDocs, findSection } from './lib/docs.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (rel) => path.join(ROOT, rel);

const args = parseArgs(process.argv.slice(2));
const DRY = !!args['dry-run'];
const slug = slugify(args._[0] || '');
const sectionArg = args._[1] || '';
if (!slug || !sectionArg) fail('Usage: npm run new-section -- <page-slug> <section-name>');

guardStarter();

// Resolve the section name against docs/ (loose), falling back to the raw name.
let section = slugify(sectionArg);
const { pages } = readDocs(P('docs'));
const found = findSection(pages, slug, sectionArg);
if (found.section) {
	section = found.section.section;
} else if (found.candidates && pages.find((p) => p.slug === slug)) {
	fail(`${found.error}.\n  Sections on ${slug}: ${found.candidates.join(', ')}`);
}
if (RESERVED_SECTIONS.has(section)) fail(`section "${section}" is reserved (title/seo).`);

const group = sectionGroup(section);
const Comp = sectionComponent(section);
const pageDir = slug === 'home' ? 'app/(site)' : `app/(site)/${slug}`;
const pageFile = `${pageDir}/page.js`;
const pageFolder = slug === 'home' ? 'Home' : toPascal(slug);
const compRel = `components/sections/${pageFolder}/${Comp}.js`;

if (!existsSync(P(pageFile))) fail(`${pageFile} not found. Run /schema (or npm run new-page -- ${slug}) first.`);

step('new-section', `${c.bold(`${slug} / ${section}`)}  ${c.dim(`<${Comp}/> · group ${group}`)}`);
const pending = [];

// ── Component stub ──────────────────────────────────────────────────────────
if (existsSync(P(compRel))) {
	info(`${compRel} exists, leaving it`);
} else {
	pending.push([`create ${compRel}`, () => {
		mkdirSync(path.dirname(P(compRel)), { recursive: true });
		writeFileSync(P(compRel), componentStub());
	}]);
}

// ── Wire into the page ──────────────────────────────────────────────────────
const { text: pageText, eol } = readText(P(pageFile));
let next = pageText;
const importLine = `import ${Comp} from '@/components/sections/${pageFolder}/${Comp}';`;
if (!next.includes(importLine)) {
	next = insertAfterLast(next, /^import .* from '.*';?$/, importLine);
}
// Plain element (no spread yet) so the page builds before the group exists in
// scope; /section swaps in <Comp {...group} /> when it wires the real data.
const element = `\t\t\t<${Comp} />`;
if (!new RegExp(`<${Comp}\\b`).test(next)) {
	if (next.includes('</PageContainer>')) {
		next = insertBeforeFirst(next, '</PageContainer>', element);
	} else {
		warn(`couldn't find </PageContainer> in ${pageFile}; add <${Comp} {...${group}} /> by hand.`);
	}
}
if (next !== pageText) {
	pending.push([`wire <${Comp}/> into ${pageFile}`, () => writeText(P(pageFile), next, eol)]);
}

// ── Apply ────────────────────────────────────────────────────────────────
if (!pending.length) {
	info('Nothing to do; already wired.');
} else if (DRY) {
	for (const [label] of pending) info(`would ${label}`);
} else {
	for (const [label, fn] of pending) {
		fn();
		ok(label);
	}
}

console.log(
	`\n${c.dim('Next (/section builds it):')} destructure ${c.bold(group)} from the page's query data and\n` +
		`spread it (<${Comp} {...${group}} />), then build ${compRel} against the real fields.`,
);
console.log('');

// ════════════════════════════════════════════════════════════════════════════

function componentStub() {
	const isHero = /hero/.test(section);
	return `import Section from '@/components/layout/Section';

// Stub created by new-section. /section builds the real markup from the
// screenshot and the page's query. When wired for real the page spreads the
// "${group}" schema group in as props (<${Comp} {...${group}} />) and this
// destructures the real named props (never one \`data\` object).
const ${Comp} = () => {
\treturn (
\t\t<Section${isHero ? " as='header'" : ''}>
\t\t\t{/* TODO (/section): build the ${section} section */}
\t\t</Section>
\t);
};

export default ${Comp};
`;
}

function guardStarter() {
	try {
		const pkg = JSON.parse(readFileSync(P('package.json'), 'utf8'));
		if (pkg.name === 'latz-starter') fail('new-section is for client projects. This is the starter.');
	} catch (e) {
		if (/starter/.test(e.message)) throw e;
	}
}
