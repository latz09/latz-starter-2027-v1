#!/usr/bin/env node
// scripts/new-page.mjs  (npm run new-page -- <slug>)
// Scaffolds one page's boilerplate and registers it, so /schema only has to
// fill in the real section fields. Creates (skipping anything that exists):
//   - sanity/schemaTypes/<type>.js        title + SEO stub
//   - data/queries/pages/FETCH_<X>_PAGE_QUERY.js
//   - app/(site)/<slug>/page.js           (app/(site)/page.js for home)
// and registers the page in schemaTypes/index.js, sanity/structure.js and
// sanity/presentation.js. Idempotent: safe to run for every page in a build.
//
//   npm run new-page -- agendas-minutes
//   npm run new-page -- agendas-minutes --title "Agendas & Minutes" --icon Documents
//   npm run new-page -- home --dry-run
//
// Pure Node. Matches each target file's own style (Sanity files 2-space,
// no semicolons; app files tabs). /schema calls it; run it by hand the same way.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, c, step, ok, warn, info, fail } from './lib/args.mjs';
import { readText, writeText, insertAfterLast, insertBeforeFirst } from './lib/text.mjs';
import { slugify, pageType, pageRoute, pageTitle, pageQueryName, toPascal } from './lib/names.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (rel) => path.join(ROOT, rel);

const args = parseArgs(process.argv.slice(2));
const DRY = !!args['dry-run'];
const slug = slugify(args._[0] || '');
if (!slug) fail('Usage: npm run new-page -- <slug> [--title "..."] [--icon IconName]');

guardStarter();

const type = pageType(slug);
const route = pageRoute(slug);
const title = args.title && args.title !== true ? String(args.title) : pageTitle(slug);
const component = slug === 'home' ? 'Home' : toPascal(slug);
const queryName = pageQueryName(slug);
const icon = resolveIcon(args.icon && args.icon !== true ? String(args.icon) : 'Document');

step('new-page', `${c.bold(slug)}  ${c.dim(`${route} · ${type} · ${icon}Icon`)}`);
const pending = []; // [label, fn] applied at the end unless --dry-run

// ── Files ────────────────────────────────────────────────────────────────
const schemaFile = `sanity/schemaTypes/${type}.js`;
createFile(schemaFile, schemaStub());

const queryFile = `data/queries/pages/${queryName}.js`;
createFile(queryFile, queryStub());

const pageFile = slug === 'home' ? 'app/(site)/page.js' : `app/(site)/${slug}/page.js`;
createFile(pageFile, pageStub());

// ── Registrations ──────────────────────────────────────────────────────────
registerBarrel();
registerStructure();
registerPresentation();

// ── Apply ────────────────────────────────────────────────────────────────
if (!pending.length) {
	info('Nothing to do; everything is already in place.');
} else if (DRY) {
	for (const [label] of pending) info(`would ${label}`);
} else {
	for (const [label, fn] of pending) {
		fn();
		ok(label);
	}
}
console.log('');

// ════════════════════════════════════════════════════════════════════════════

function createFile(rel, contents) {
	if (existsSync(P(rel))) {
		info(`${rel} exists, leaving it`);
		return;
	}
	pending.push([`create ${rel}`, () => {
		mkdirSync(path.dirname(P(rel)), { recursive: true });
		writeFileSync(P(rel), contents);
	}]);
}

// Edit a file through the pending queue, preserving its EOL.
function edit(rel, label, transform) {
	const { text, eol } = readText(P(rel));
	const next = transform(text);
	if (next == null || next === text) return; // already done
	pending.push([label, () => writeText(P(rel), next, eol)]);
}

function registerBarrel() {
	const rel = 'sanity/schemaTypes/index.js';
	edit(rel, `register ${type} in ${rel}`, (text) => {
		if (new RegExp(`\\b${type}\\b`).test(text)) return null;
		let out = insertAfterLast(text, /^import \w+Page from '\.\//, `import ${type} from './${type}'`);
		out = insertAfterLast(out, /^\s+\w+Page,\s*$/, `  ${type},`);
		return out;
	});
}

function registerStructure() {
	const rel = 'sanity/structure.js';
	edit(rel, `register ${type} in ${rel}`, (text) => {
		if (new RegExp(`'${type}'`).test(text)) return null;
		let out = text;
		// Icon import (skip if already imported).
		if (!new RegExp(`@sanity/icons/${icon}'`).test(out)) {
			out = insertAfterLast(out, /^import \{ \w+Icon \} from '@sanity\/icons\//, `import { ${icon}Icon } from '@sanity/icons/${icon}'`);
		}
		// singletonTypes set.
		out = insertAfterLast(out, /^\s+'\w+Page',\s*$/, `  '${type}',`);
		// Sidebar list item, before the first divider.
		const item = [
			`      S.listItem()`,
			`        .title('${title} Page')`,
			`        .icon(${icon}Icon)`,
			`        .child(S.document().schemaType('${type}').documentId('${type}')),`,
		].join('\n');
		out = insertBeforeFirst(out, 'S.divider()', item);
		return out;
	});
}

function registerPresentation() {
	const rel = 'sanity/presentation.js';
	edit(rel, `register ${type} in ${rel}`, (text) => {
		if (new RegExp(`type: '${type}'`).test(text)) return null;
		const lines = text.split('\n');
		const startIdx = lines.findIndex((l) => l.includes('const PAGES = ['));
		if (startIdx === -1) throw new Error('PAGES array not found in presentation.js');
		const closeIdx = lines.findIndex((l, i) => i > startIdx && l.trim() === '];');
		if (closeIdx === -1) throw new Error('end of PAGES array not found');
		lines.splice(closeIdx, 0, `\t{ type: '${type}', title: '${title}', route: '${route}' },`);
		return lines.join('\n');
	});
}

// ── Stubs (match each file's own style) ──────────────────────────────────────
function schemaStub() {
	return `// schemaTypes/${type}.js
// Stub — title + SEO only. /schema Phase 1 replaces this with the real section
// fields (one object field per screenshot group) once docs/ is in.

import { seoField } from './partials/seoField'

export default {
  name: '${type}',
  type: 'document',
  title: '${title} Page',
  groups: [{ name: 'seo', title: '🔍 SEO' }],
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      initialValue: '${title}',
    },
    ...seoField.map((f) => ({ ...f, group: 'seo' })),
  ],
  preview: {
    select: { title: 'title' },
  },
}
`;
}

function queryStub() {
	return `export const ${queryName} = \`*[_type == "${type}" && _id == "${type}"][0]{
  title,
  seo{
    title,
    description,
    keywords,
    "ogImage": ogImage.asset->url,
    noIndex,
  }
}\`
`;
}

function pageStub() {
	return `import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { ${queryName} as Q } from '@/data/queries/pages/${queryName}';
import PageContainer from '@/components/animations/PageContainer';
import Section from '@/components/layout/Section';

export async function generateMetadata() {
\treturn BPM({ slug: '${route}', query: Q });
}

const ${component} = async () => {
\tconst data = await fc(Q);

\treturn (
\t\t<PageContainer>
\t\t\t<Section className='h-[80vh] grid place-items-center'>
\t\t\t\t<h1>{data?.title ?? '${title}'}</h1>
\t\t\t</Section>
\t\t</PageContainer>
\t);
};

export default ${component};

export const revalidate = 10;
`;
}

// ── Helpers ──────────────────────────────────────────────────────────────
function guardStarter() {
	try {
		const pkg = JSON.parse(readFileSync(P('package.json'), 'utf8'));
		if (pkg.name === 'latz-starter') fail('new-page is for client projects. This is the starter.');
	} catch (e) {
		if (/starter/.test(e.message)) throw e;
	}
}

// Return the icon name if it exists in the installed @sanity/icons, else fall
// back to Document (then Cog), warning. Icon name has no "Icon" suffix here.
function resolveIcon(name) {
	const clean = name.replace(/Icon$/, '');
	let available;
	try {
		const exportsMap = JSON.parse(readFileSync(P('node_modules/@sanity/icons/package.json'), 'utf8')).exports;
		available = new Set(Object.keys(exportsMap).filter((k) => k.startsWith('./') && k !== './package.json').map((k) => k.slice(2)));
	} catch {
		return clean; // node_modules not installed; trust the caller
	}
	if (available.has(clean)) return clean;
	for (const fb of ['Document', 'Cog']) if (available.has(fb)) {
		warn(`icon "${clean}" not found in @sanity/icons; using ${fb}. Check: node scripts/check-icon.mjs <name>`);
		return fb;
	}
	return clean;
}
