#!/usr/bin/env node
// scripts/seed.mjs  (npm run seed)
// Writes the copy in docs/seed/*.json into Sanity as real, PUBLISHED documents.
// Safe by default: it only fills documents and fields that are empty and never
// overwrites an edit made in Studio. Reads SANITY_API_TOKEN, the project ID and
// the dataset from .env.local itself (Claude never reads .env files). The token
// is never printed.
//
//   npm run seed -- --dry-run            show what would change (reads Sanity, writes nothing)
//   npm run seed -- --dry-run --offline  check the files only: no network, no token
//   npm run seed                         write it (fill-empty only)
//   npm run seed -- home about           only those files (docs/seed/home.json, ...)
//   npm run seed -- --force              overwrite the fields in the files (still never deletes)
//   npm run seed -- --init home          write a skeleton docs/seed/home.json
//
// Always put --dry-run first when combining flags.
// Images are skipped in this version: { "$image": "..." } markers are counted, not uploaded.
// File shape and rules: docs/README.md ("Seed files").

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { c, fail } from './lib/args.mjs';
import { readDocs } from './lib/docs.mjs';
import { pageTitle, pageType } from './lib/names.mjs';
import { loadSeedFiles, loadEnv, readApiVersion, createSanityClient, runSeed } from './lib/seed.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Own parser: lib/args.mjs would let `--dry-run home` swallow `home` as the
// flag's value. Here the flags are known booleans, so page names stay names.
const args = parseSeedArgs(process.argv.slice(2));
const DRY = !!args['dry-run'];
const OFFLINE = !!args.offline;
const FORCE = !!args.force;

if (args.help || args.h) usage(0);

guardStarter();

// ── --init <slug> ───────────────────────────────────────────────────────────
if (args.init !== undefined) {
	const slug = args.init;
	if (!slug) fail('Usage: npm run seed -- --init <page-slug>');
	initSkeleton(slug);
	process.exit(0);
}

if (OFFLINE && !DRY) fail('--offline only works with --dry-run: npm run seed -- --dry-run --offline');
if (FORCE && DRY) console.log(c.dim('(--dry-run: showing what --force would overwrite; nothing is written)'));

const { files, problems, dirMissing } = loadSeedFiles(ROOT, { only: args._ });
if (problems.length) {
	console.error(c.bold('\nProblems in docs/seed/ (nothing was written):'));
	for (const p of problems) console.error(`  ${c.red('✗')} ${p}`);
	console.error('');
	process.exit(1);
}
if (dirMissing || !files.length) {
	console.log(`\nNo seed files found in docs/seed/. Write one per page (npm run seed -- --init home), see docs/README.md.\n`);
	process.exit(0);
}

// ── Connect (skipped for --offline) ─────────────────────────────────────────
let client = null;
let target = 'offline (every document treated as empty)';
if (!OFFLINE) {
	const env = loadEnv(ROOT);
	if (!env.projectId) fail('NEXT_PUBLIC_SANITY_PROJECT_ID is not set (.env.local). Run new-client, or use --dry-run --offline to check the files only.');
	if (!env.token) fail('SANITY_API_TOKEN is not set (.env.local). new-client creates it; or make an Editor token in sanity.io/manage → API → Tokens.');
	client = createSanityClient({ projectId: env.projectId, dataset: env.dataset, token: env.token, apiVersion: readApiVersion(ROOT) });
	target = `project ${env.projectId}, dataset ${env.dataset}`;
}

console.log(c.bold(`\n${DRY ? 'Dry run' : 'Seeding'}: ${target}${FORCE ? c.red('  --force: overwriting fields that already have content') : ''}`));

let out;
try {
	out = await runSeed({ files, client, force: FORCE, dryRun: DRY });
} catch (e) {
	fail(e.message);
}

report(out);

// ════════════════════════════════════════════════════════════════════════════

function report({ results, drafts, images, notes, unknown, written }) {
	const verb = DRY ? { create: 'would CREATE', fill: 'would FILL', over: 'would OVERWRITE' } : { create: 'CREATED', fill: 'FILLED', over: 'OVERWROTE' };
	const show = (list, max = 30) => {
		const shown = list.slice(0, max).map((p) => `        ${c.dim('+')} ${p}`);
		if (list.length > max) shown.push(`        ${c.dim(`… and ${list.length - max} more`)}`);
		return shown.join('\n');
	};

	let nothing = 0;
	for (const { d, plan } of results) {
		console.log(`\n${c.bold(d.id)}  ${c.dim(`${d.type} · ${d.file}`)}`);
		const p = plan.published;
		if (p.mode === 'create') {
			console.log(`  published  ${c.green(verb.create)} (no published document yet): ${p.fill.length} field(s)`);
			console.log(show(p.fill));
		} else if (p.mode === 'patch') {
			if (p.fill.length) console.log(`  published  ${c.green(verb.fill)} ${p.fill.length} empty field(s)`), console.log(show(p.fill));
			if (p.overwrite.length) console.log(`  published  ${c.red(verb.over)} ${p.overwrite.length} field(s)`), console.log(show(p.overwrite));
			if (p.kept.length) console.log(`  ${c.dim(`           kept ${p.kept.length} field(s) that already have content`)}`);
		} else {
			console.log(`  published  ${c.dim(p.exists ? 'nothing to do (every field in the file already has content)' : 'nothing to write (no content in the file)')}`);
		}
		if (plan.draft) {
			const dr = plan.draft;
			if (dr.mode === 'patch') {
				console.log(`  draft      ${c.yellow(`⚠ ${dr.id} has unpublished edits in Studio, and ${DRY ? 'would be' : 'was'} changed too`)}`);
				if (dr.fill.length) console.log(`             ${verb.fill} ${dr.fill.length} empty field(s)`), console.log(show(dr.fill));
				if (dr.overwrite.length) console.log(`             ${c.red(verb.over)} ${dr.overwrite.length} field(s)`), console.log(show(dr.overwrite));
			} else {
				console.log(`  draft      ${c.dim(`${dr.id} exists, nothing to change`)}`);
			}
		}
		if (!plan.published.fill.length && !plan.published.overwrite.length && !(plan.draft && plan.draft.mode === 'patch')) nothing++;
	}

	// ── Warnings that never block ───────────────────────────────────────────
	if (unknown.length) {
		console.log(c.bold(`\nNot written: ${unknown.length} key(s) that are not in the schema (typo? fix the name in the seed file):`));
		for (const u of unknown) console.log(`  ${c.yellow('!')} ${u.doc}: ${u.path}`);
	}
	if (images.length) {
		console.log(c.bold(`\nImages skipped (${images.length}): not uploaded in this version. Add them in Studio.`));
		for (const i of images.slice(0, 15)) console.log(`  ${c.dim('·')} ${i.doc}: ${i.path}  ${c.dim(i.source)}`);
		if (images.length > 15) console.log(`  ${c.dim(`… and ${images.length - 15} more`)}`);
	}
	if (notes.length) {
		console.log(c.bold(`\nOpen notes in the seed files (${notes.length}, not written):`));
		for (const n of notes) console.log(`  ${c.dim('·')} ${n.doc}: ${n.path}  ${c.dim(n.text)}`);
	}

	// ── Summary ─────────────────────────────────────────────────────────────
	const created = results.filter((r) => r.plan.published.mode === 'create').length;
	const patched = results.filter((r) => r.plan.published.mode === 'patch').length;
	console.log(c.bold('\nSummary'));
	console.log(`  ${results.length} document(s): ${created} ${DRY ? 'to create' : 'created'}, ${patched} ${DRY ? 'to update' : 'updated'}, ${nothing} with nothing to do.`);
	if (drafts.length) {
		console.log(c.yellow(`  Drafts ${DRY ? 'that would be' : ''} touched (${drafts.length}): ${drafts.join(', ')}`));
		console.log(c.dim(DRY
			? '  These have unpublished edits in Studio. They would get the empty fields filled; Studio will show them as changed until you publish or discard.'
			: '  In Studio these now show the new copy as unpublished changes. Publish them, or discard if the copy came from here.'));
	} else {
		console.log(c.dim('  No drafts touched.'));
	}
	if (DRY) console.log(c.dim(`  Nothing was written. ${OFFLINE ? '' : 'Run npm run seed to write it.'}`));
	else console.log(c.green(`  ${written} transaction(s) written.`));
	console.log('');
}

function initSkeleton(slug) {
	const { pages } = readDocs(path.join(ROOT, 'docs'));
	const page = pages.find((p) => p.slug === slug);
	const dir = path.join(ROOT, 'docs/seed');
	const file = path.join(dir, `${slug}.json`);
	if (existsSync(file)) fail(`docs/seed/${slug}.json already exists. Edit it, or delete it first. (init never overwrites.)`);
	const body = { title: pageTitle(slug) };
	for (const s of page?.sections || []) body[s.group] = { _todo: `fill from the Figma design (${s.file}); keys must match the ${pageType(slug)} schema` };
	body.seo = { title: '', description: '' };
	mkdirSync(dir, { recursive: true });
	writeFileSync(file, JSON.stringify(body, null, '\t') + '\n');
	console.log(`\nWrote docs/seed/${slug}.json${page ? ` (${page.sections.length} section group(s) from the screenshots)` : ' (no screenshots for this page: title + seo only)'}`);
	console.log(c.dim(`Fill in the copy (keys match the ${pageType(slug)} schema), then: npm run seed -- --dry-run --offline\n`));
}

function parseSeedArgs(argv) {
	const out = { _: [], init: undefined };
	const BOOLEAN = new Set(['dry-run', 'offline', 'force', 'help', 'h']);
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (!a.startsWith('-')) out._.push(a);
		else if (a === '--init') out.init = argv[++i] && !argv[i].startsWith('-') ? argv[i] : '';
		else if (BOOLEAN.has(a.replace(/^--?/, ''))) out[a.replace(/^--?/, '')] = true;
		else fail(`Unknown option ${a}. Try: npm run seed -- --help`);
	}
	return out;
}

function guardStarter() {
	try {
		const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
		if (pkg.name === 'latz-starter') fail('seed is for client projects. This is the starter: it has no content and no Sanity project.');
	} catch (e) {
		if (e?.code !== 'ENOENT') throw e;
	}
}

function usage(code) {
	console.log(`
${c.bold('npm run seed')}  fill Sanity from docs/seed/*.json (published, fill-empty only)

  npm run seed -- --dry-run            show what would change (reads Sanity, writes nothing)
  npm run seed -- --dry-run --offline  check the files only (no network, no token)
  npm run seed                         write it
  npm run seed -- home about           only docs/seed/home.json and about.json
  npm run seed -- --force              overwrite the fields in the files (never deletes others)
  npm run seed -- --init <slug>        write a skeleton docs/seed/<slug>.json

Put --dry-run first when combining flags. See docs/README.md ("Seed files").
`);
	process.exit(code);
}
