#!/usr/bin/env node
// scripts/check.mjs  (npm run check)
// Pre-launch check: catches the things easy to forget before a client goes
// live. Read-only. Blockers exit 1; warnings don't. It reads .env.local only to
// see WHICH keys are set and NEVER prints a value — just names and presence.
//
//   npm run check
//
// It can't verify anything off the machine (Sanity CORS, Vercel env vars,
// inviting the client, the contact form actually sending) — those are listed at
// the end as a manual checklist.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { c } from './lib/args.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (rel) => path.join(ROOT, rel);
const read = (rel) => (existsSync(P(rel)) ? readFileSync(P(rel), 'utf8') : null);

const results = []; // { level: 'blocker'|'warn', ok, msg }
const blocker = (ok, msg) => results.push({ level: 'blocker', ok, msg });
const warn = (ok, msg) => results.push({ level: 'warn', ok, msg });

// Checks run after all helpers are defined (see run() at the bottom).
function run() {
// ── Env vars (names + presence only, never values) ──────────────────────────
const env = parseEnv(read('.env.local'));
const REQUIRED = ['NEXT_PUBLIC_SANITY_PROJECT_ID', 'NEXT_PUBLIC_SITE_URL', 'RESEND_API_KEY', 'CLIENT_EMAIL'];
const RECOMMENDED = ['SANITY_VIEWER_TOKEN', 'SANITY_API_TOKEN', 'NEXT_PUBLIC_SANITY_DATASET'];
if (env === null) {
	blocker(false, '.env.local not found (run new-client, or copy .env.example)');
} else {
	for (const k of REQUIRED) blocker(!!env[k], `${k} is set`);
	for (const k of RECOMMENDED) warn(!!env[k], `${k} is set`);
}

// ── Placeholders left in code ───────────────────────────────────────────────
const branding = read('sanity/branding.js') || '';
const contact = read('data/config/contact.js') || '';
blocker(!/CLIENT_NAME/.test(branding + contact), 'CLIENT_NAME replaced in branding.js and contact.js');

const cmsGuide = read('public/cms-guide.html') || '';
blocker(!/PLACEHOLDER/.test(cmsGuide), 'public/cms-guide.html replaced (placeholder gone)');

const logo = read('public/cms/client-logo.svg') || '';
warn(!(/\/cms\/client-logo\.svg/.test(branding) && />LW</.test(logo)), 'Studio logo set (branding.logoUrl / client-logo.svg not the placeholder)');

const contactPhone = contact.match(/phone:\s*'([^']*)'/);
warn(!(contactPhone && contactPhone[1] === ''), "contact.js branding phone filled in (or intentionally blank)");

// ── Button kit ──────────────────────────────────────────────────────────────
const buttonLink = read('components/ui/ButtonLink.js') || '';
blocker(!/STARTER TEMPLATE BUTTON/.test(buttonLink), 'A button kit was chosen (ButtonLink.js is not the starter stub)');

// ── Theme ───────────────────────────────────────────────────────────────────
const tw = read('tailwind.config.js') || '';
warn(!/#025088/.test(tw), 'Theme applied (starter default palette replaced — run /theme)');

// ── /design/checklist still present ─────────────────────────────────────────
blocker(!existsSync(P('app/(site)/design/checklist/page.js')), 'Remove app/(site)/design/checklist at launch');

// ── Pages still on the title-only placeholder ───────────────────────────────
const placeholderPages = pageFiles().filter((f) => {
	const txt = read(f) || '';
	return /data\?\.(page\?\.)?title \?\?/.test(txt) && !/@\/components\/sections\//.test(txt);
});
warn(placeholderPages.length === 0, placeholderPages.length ? `pages still on the placeholder: ${placeholderPages.map((f) => (f === 'app/(site)/page.js' ? 'home' : f.replace('app/(site)/', '').replace('/page.js', ''))).join(', ')}` : 'every page renders real sections');

// ── Page registration in sync ───────────────────────────────────────────────
checkRegistration();

// ── Seed files (copy that npm run seed puts into Sanity) ────────────────────
checkSeedFiles();

// ── Report ──────────────────────────────────────────────────────────────────
print();
}

// ════════════════════════════════════════════════════════════════════════════

function parseEnv(text) {
	if (text == null) return null;
	const out = {};
	for (const line of text.split('\n')) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
		if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '').trim(); // value length only matters as truthy; never printed
	}
	return out;
}

function pageFiles() {
	const base = 'app/(site)';
	const out = [];
	const home = `${base}/page.js`;
	if (existsSync(P(home))) out.push(home);
	for (const entry of safeReaddir(base)) {
		const f = `${base}/${entry}/page.js`;
		if (existsSync(P(f)) && !['design', 'legal'].includes(entry)) out.push(f);
	}
	return out;
}
const safeReaddir = (rel) => (existsSync(P(rel)) ? readdirSync(P(rel), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name) : []);

function checkRegistration() {
	const index = read('sanity/schemaTypes/index.js') || '';
	const structure = read('sanity/structure.js') || '';
	const presentation = read('sanity/presentation.js') || '';
	const types = [...index.matchAll(/^import (\w+Page) from/gm)].map((m) => m[1]);
	for (const t of types) {
		const inStructure = new RegExp(`'${t}'`).test(structure);
		const inPresentation = new RegExp(`type: '${t}'`).test(presentation);
		const hasQuery = queryFilesMention(t);
		warn(inStructure && inPresentation && hasQuery, `${t} registered everywhere (structure${inStructure ? '' : ' ✗'}, presentation${inPresentation ? '' : ' ✗'}, query${hasQuery ? '' : ' ✗'})`);
	}
}
// Offline only: every page type should have docs/seed/<slug>.json, and the
// seed files should have no open notes. Whether Sanity actually has the copy is
// a live question: `npm run seed -- --dry-run` answers it ("nothing to do" = seeded).
function checkSeedFiles() {
	const index = read('sanity/schemaTypes/index.js') || '';
	const slugs = [...index.matchAll(/^import (\w+)Page from/gm)].map((m) => m[1].replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, ''));
	const have = new Set(safeFiles('docs/seed').filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, '')));
	for (const slug of slugs) warn(have.has(slug), have.has(slug) ? `docs/seed/${slug}.json exists` : `no docs/seed/${slug}.json (that page's copy is not seeded: npm run seed -- --init ${slug})`);
	let open = 0;
	const SYSTEM = new Set(['_type', '_id', '_key', '_ref', '_weak']);
	const count = (v) => {
		if (Array.isArray(v)) return v.forEach(count);
		if (v && typeof v === 'object') for (const [k, val] of Object.entries(v)) k.startsWith('_') && !SYSTEM.has(k) ? (typeof val === 'string' && val.trim() && open++) : count(val);
	};
	for (const f of have) {
		try { count(JSON.parse(read(`docs/seed/${f}.json`))); } catch { warn(false, `docs/seed/${f}.json is not valid JSON`); }
	}
	if (have.size) warn(open === 0, open ? `${open} open _todo/_note in docs/seed/ (npm run seed -- --dry-run --offline lists them)` : 'no open _todo/_note in docs/seed/');
	if (have.size) hint = 'Is the copy in Sanity yet? npm run seed -- --dry-run says "nothing to do" once it is.';
}
const safeFiles = (rel) => (existsSync(P(rel)) ? readdirSync(P(rel), { withFileTypes: true }).filter((e) => e.isFile()).map((e) => e.name) : []);
let hint = '';

const safeReaddirFiles = (rel) => (existsSync(P(rel)) ? readdirSync(P(rel)).filter((f) => f.endsWith('.js')) : []);
function queryFilesMention(type) {
	for (const f of safeReaddirFiles('data/queries/pages')) {
		if (new RegExp(`"${type}"`).test(read(`data/queries/pages/${f}`) || '')) return true;
	}
	return false;
}

function print() {
	const blockers = results.filter((r) => r.level === 'blocker');
	const warns = results.filter((r) => r.level === 'warn');
	const failedBlockers = blockers.filter((r) => !r.ok);
	const failedWarns = warns.filter((r) => !r.ok);

	console.log(c.bold('\nPre-launch check\n'));
	for (const r of results) {
		const mark = r.ok ? c.green('✓') : r.level === 'blocker' ? c.red('✗') : c.yellow('!');
		console.log(`  ${mark} ${r.msg}`);
	}

	if (hint) console.log(`\n  ${c.dim(hint)}`);

	console.log(c.bold('\nStill to do off the machine (check by hand):'));
	for (const m of [
		'Add the live domain to Sanity CORS (Allow credentials)',
		'Copy every .env.local value into Vercel (Production + Preview)',
		'Invite the client in sanity.io/manage → Members',
		'Send a real contact form submission and confirm the email + Studio submission',
	]) console.log(`  ${c.dim('·')} ${m}`);

	console.log('');
	if (failedBlockers.length) {
		console.log(c.red(`${failedBlockers.length} blocker(s) to fix before launch.`) + (failedWarns.length ? c.yellow(` ${failedWarns.length} warning(s).`) : ''));
		process.exit(1);
	}
	console.log(c.green('No blockers.') + (failedWarns.length ? c.yellow(` ${failedWarns.length} warning(s) to review.`) : ' Ready when the off-machine items are done.'));
}

run();
