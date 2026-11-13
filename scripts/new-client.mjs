#!/usr/bin/env node
// scripts/new-client.mjs
// Creates a new client project from this starter, in one go:
//
//   1. Copies the starter (committed files at HEAD) into a new folder
//   2. Sets the client name (package.json, Studio title, contact form)
//   3. npm ci
//   4. Sanity: creates the client's own organization + project + dataset,
//      adds CORS origins, creates the viewer and editor API tokens
//   5. Writes .env.local
//   6. git init + first commit (nothing is pushed)
//
// Run from your local clone of the starter:
//
//   npm run new-client -- --name "Acme Cleaning Co"
//   npm run new-client -- --name "Acme Cleaning Co" --domain acmecleaning.com
//
// Options:
//   --name "Client Name"   required
//   --dir <path>           target folder (default: ../<client-slug>, next to the starter)
//   --domain <domain>      live domain, added to Sanity CORS (https://domain + https://www.domain)
//   --org <orgId>          use an existing Sanity organization instead of creating one
//   --skip-sanity          copy + install + commit only, no Sanity provisioning
//   --skip-install         skip npm ci (Sanity steps need it, so this implies --skip-sanity)
//
// Needs: Node >= 22.12, git, and a Sanity login (the script runs
// `sanity login` for you if you're logged out).

import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, rmSync, mkdirSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const STARTER_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// ── helpers ────────────────────────────────────────────────────────────────

const c = {
	bold: (s) => `\x1b[1m${s}\x1b[0m`,
	green: (s) => `\x1b[32m${s}\x1b[0m`,
	yellow: (s) => `\x1b[33m${s}\x1b[0m`,
	red: (s) => `\x1b[31m${s}\x1b[0m`,
	dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

const step = (n, msg) => console.log(`\n${c.bold(`[${n}]`)} ${msg}`);
const ok = (msg) => console.log(`    ${c.green('✓')} ${msg}`);
const warn = (msg) => console.log(`    ${c.yellow('!')} ${msg}`);
const fail = (msg) => {
	console.error(`\n${c.red('✗')} ${msg}\n`);
	process.exit(1);
};

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (!a.startsWith('--')) continue;
		const key = a.slice(2);
		const next = argv[i + 1];
		if (next === undefined || next.startsWith('--')) args[key] = true;
		else {
			args[key] = next;
			i++;
		}
	}
	return args;
}

const slugify = (s) =>
	s
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

// Runs a command and returns stdout. stderr streams to the terminal so
// prompts and spinners stay visible.
function run(cmd, args, opts = {}) {
	return execFileSync(cmd, args, {
		encoding: 'utf8',
		stdio: ['inherit', 'pipe', 'inherit'],
		...opts,
	});
}

// Runs a command fully interactive (login, installs). Returns exit status.
function runInteractive(cmd, args, opts = {}) {
	return spawnSync(cmd, args, { stdio: 'inherit', ...opts }).status;
}

// The Sanity CLI prints a JSON object on --json, sometimes after other output.
function parseJsonOutput(out, what) {
	const start = out.indexOf('{');
	const end = out.lastIndexOf('}');
	if (start === -1 || end === -1) fail(`Couldn't read ${what} from the Sanity CLI output:\n${out}`);
	return JSON.parse(out.slice(start, end + 1));
}

const replaceInFile = (file, pairs) => {
	let s = readFileSync(file, 'utf8');
	for (const [from, to] of pairs) s = s.split(from).join(to);
	writeFileSync(file, s);
};

// JS string literal, safe for names like "Bob's Diner".
const jsString = (s) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;

// ── args ───────────────────────────────────────────────────────────────────

const args = parseArgs(process.argv.slice(2));
const clientName = typeof args.name === 'string' ? args.name.trim() : '';
if (!clientName) fail('Missing --name. Example: npm run new-client -- --name "Acme Cleaning Co"');

const slug = slugify(clientName);
const targetDir = path.resolve(
	typeof args.dir === 'string' ? args.dir : path.join(STARTER_DIR, '..', slug),
);
const domain =
	typeof args.domain === 'string'
		? args.domain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '')
		: null;
const skipInstall = Boolean(args['skip-install']);
const skipSanity = Boolean(args['skip-sanity']) || skipInstall;
const existingOrg = typeof args.org === 'string' ? args.org : null;

const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 22 || (major === 22 && minor < 12)) {
	fail(`Node ${process.versions.node} is too old. The starter needs Node >= 22.12.`);
}

console.log(c.bold(`\nNew Latz client: ${clientName}`));
console.log(c.dim(`  folder: ${targetDir}`));
if (domain) console.log(c.dim(`  domain: ${domain}`));
if (skipSanity) console.log(c.dim('  Sanity: skipped'));

// ── 1. copy ────────────────────────────────────────────────────────────────

step(1, 'Copying the starter');

if (existsSync(targetDir)) fail(`${targetDir} already exists. Pick another --dir or remove it.`);

const gitStatus = run('git', ['status', '--porcelain'], { cwd: STARTER_DIR }).trim();
if (gitStatus) {
	warn('The starter has uncommitted changes. Only committed files (HEAD) are copied.');
}

const starterPkg = JSON.parse(readFileSync(path.join(STARTER_DIR, 'package.json'), 'utf8'));
const starterVersion = starterPkg.version;
const starterCommit = run('git', ['rev-parse', '--short', 'HEAD'], { cwd: STARTER_DIR }).trim();

mkdirSync(targetDir, { recursive: true });
// git archive = exactly the committed tree: no node_modules, .next, .env.local.
const archivePath = path.join(os.tmpdir(), `latz-starter-${Date.now()}.tar`);
execFileSync('git', ['archive', '--format=tar', '-o', archivePath, 'HEAD'], { cwd: STARTER_DIR });
execFileSync('tar', ['-xf', archivePath, '-C', targetDir]);
rmSync(archivePath);
ok(`latz-starter v${starterVersion} (${starterCommit})`);

// ── 2. client name ─────────────────────────────────────────────────────────

step(2, 'Setting the client name');

const pkgPath = path.join(targetDir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.name = slug;
pkg.version = '0.1.0';
delete pkg.scripts['new-client'];
// Which starter this project began from, for /promote and future syncs.
pkg.latzStarter = { version: starterVersion, commit: starterCommit };
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, '\t')}\n`);

const lockPath = path.join(targetDir, 'package-lock.json');
if (existsSync(lockPath)) {
	const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
	lock.name = slug;
	lock.version = '0.1.0';
	if (lock.packages?.['']) {
		lock.packages[''].name = slug;
		lock.packages[''].version = '0.1.0';
	}
	writeFileSync(lockPath, `${JSON.stringify(lock, null, '\t')}\n`);
}

replaceInFile(path.join(targetDir, 'sanity/branding.js'), [
	["studioTitle: 'CLIENT_NAME'", `studioTitle: ${jsString(clientName)}`],
]);
replaceInFile(path.join(targetDir, 'data/config/contact.js'), [
	["name: 'CLIENT_NAME'", `name: ${jsString(clientName)}`],
	["autoResponseClosing: 'CLIENT_NAME'", `autoResponseClosing: ${jsString(clientName)}`],
]);

// The client repo doesn't need the generator.
rmSync(path.join(targetDir, 'scripts/new-client.mjs'));
ok('package.json, sanity/branding.js, data/config/contact.js');

// ── 3. install ─────────────────────────────────────────────────────────────

step(3, 'Installing dependencies (npm ci)');
if (skipInstall) {
	warn('Skipped (--skip-install). Run npm ci before npm run dev.');
} else {
	if (runInteractive('npm', ['ci', '--no-audit', '--no-fund'], { cwd: targetDir }) !== 0) {
		fail('npm ci failed. Fix the error above, then rerun in a fresh folder.');
	}
	ok('Installed');
}

// ── 4. Sanity ──────────────────────────────────────────────────────────────

const sanity = (sanityArgs, opts) => run('npx', ['sanity', ...sanityArgs], { cwd: targetDir, ...opts });

let projectId = '';
let viewerToken = '';
let editorToken = '';
const dataset = 'production';

if (skipSanity) {
	step(4, 'Sanity');
	warn('Skipped. The site runs on placeholder content until a project ID is in .env.local.');
} else {
	step(4, 'Provisioning Sanity');

	// Login
	const loggedIn = spawnSync('npx', ['sanity', 'whoami'], { cwd: targetDir, stdio: 'ignore' }).status === 0;
	if (!loggedIn) {
		warn('Not logged in to Sanity. Opening login...');
		if (runInteractive('npx', ['sanity', 'login'], { cwd: targetDir }) !== 0) fail('Sanity login failed.');
	}
	ok('Logged in to Sanity');

	// Organization: one per client, so the client owns it.
	let orgId = existingOrg;
	if (orgId) {
		ok(`Using existing organization ${orgId}`);
	} else {
		const out = sanity(['organizations', 'create', '--name', clientName]);
		orgId = out.match(/ID:\s+(\S+)/)?.[1];
		if (!orgId) fail(`Couldn't read the new organization ID from:\n${out}`);
		ok(`Organization created: ${clientName} (${orgId})`);
	}

	// Project + public production dataset
	const project = parseJsonOutput(
		sanity([
			'projects', 'create', clientName,
			'--organization', orgId,
			'--dataset', dataset,
			'--dataset-visibility', 'public',
			'--yes', '--json',
		]),
		'the project ID',
	);
	projectId = project.projectId || project.id;
	if (!projectId) fail(`Project created but no ID found in: ${JSON.stringify(project)}`);
	ok(`Project created: ${projectId} (dataset: ${dataset})`);

	// CORS: the embedded Studio needs credentials allowed on every origin it runs on.
	const origins = ['http://localhost:3000'];
	if (domain) origins.push(`https://${domain}`, `https://www.${domain}`);
	for (const origin of origins) {
		try {
			sanity(['cors', 'add', origin, '--credentials', '--project', projectId, '--yes']);
			ok(`CORS: ${origin}`);
		} catch {
			warn(`CORS: couldn't add ${origin}. Add it in sanity.io/manage → API → CORS origins.`);
		}
	}

	// API tokens (shown once, written straight into .env.local)
	const createToken = (label, role) =>
		parseJsonOutput(
			sanity(['tokens', 'create', label, '--project', projectId, '--role', role, '--yes', '--json']),
			`the ${role} token`,
		).token;

	viewerToken = createToken('Website: draft mode (viewer)', 'viewer');
	ok('Viewer token created (SANITY_VIEWER_TOKEN)');
	editorToken = createToken('Website: contact form (editor)', 'editor');
	ok('Editor token created (SANITY_API_TOKEN)');
}

// ── 5. .env.local ──────────────────────────────────────────────────────────

step(5, 'Writing .env.local');

const env = readFileSync(path.join(targetDir, '.env.example'), 'utf8')
	.replace(/^NEXT_PUBLIC_SANITY_PROJECT_ID=.*$/m, `NEXT_PUBLIC_SANITY_PROJECT_ID=${projectId}`)
	.replace(/^NEXT_PUBLIC_SANITY_DATASET=.*$/m, `NEXT_PUBLIC_SANITY_DATASET=${dataset}`)
	.replace(/^SANITY_VIEWER_TOKEN=.*$/m, `SANITY_VIEWER_TOKEN=${viewerToken}`)
	.replace(/^SANITY_API_TOKEN=.*$/m, `SANITY_API_TOKEN=${editorToken}`)
	.replace(/^NEXT_PUBLIC_SITE_URL=.*$/m, `NEXT_PUBLIC_SITE_URL=${domain ? `https://www.${domain}` : ''}`)
	.replace(/^# \.env\.example\n/, '# .env.local (written by new-client.mjs). Never commit this file.\n');
writeFileSync(path.join(targetDir, '.env.local'), env);
ok(projectId ? 'Sanity values filled in. Add RESEND_API_KEY and CLIENT_EMAIL.' : 'Template copied, Sanity values empty.');

// ── 6. git ─────────────────────────────────────────────────────────────────

step(6, 'First commit');
run('git', ['init', '-q', '-b', 'main'], { cwd: targetDir });
run('git', ['add', '-A'], { cwd: targetDir });
run(
	'git',
	['commit', '-q', '-m', `Initial commit from latz-starter v${starterVersion} (${starterCommit})`],
	{ cwd: targetDir },
);
ok('Committed on main (not pushed)');

// ── done ───────────────────────────────────────────────────────────────────

const rel = path.relative(process.cwd(), targetDir) || '.';
console.log(`
${c.green(c.bold('Done.'))} Next steps:

  cd ${rel}
  npm run dev                      → http://localhost:3000
                                   → http://localhost:3000/latz-studio

  1. Add RESEND_API_KEY and CLIENT_EMAIL to .env.local
  2. Create the GitHub repo and push:   git remote add origin <url> && git push -u origin main
  3. Import it in Vercel and copy every .env.local value into Vercel's env vars
${domain ? '' : '  4. Once the live domain is known:      npx sanity cors add https://<domain> --credentials\n'}  ${domain ? '4' : '5'}. Invite the client: sanity.io/manage → ${clientName} → Members${projectId ? `
     https://www.sanity.io/manage/project/${projectId}/members` : ''}
`);
