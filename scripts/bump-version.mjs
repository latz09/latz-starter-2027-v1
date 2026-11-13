#!/usr/bin/env node
// scripts/bump-version.mjs  (npm run bump -- <patch|minor|major> "<line>")
// Starter only. The version-bump + CHANGELOG step of /promote, as a script.
// Bumps package.json (and package-lock.json) and adds a CHANGELOG entry. If a
// bump is already uncommitted (an earlier promote in the same working session),
// it appends the line to that entry instead of bumping twice. Never commits.
//
//   npm run bump -- patch "ButtonLink default variant fixed. Found in pilot."
//   npm run bump -- minor "Add /legal skill." --section Added
//
// --section is the CHANGELOG subsection (default Fixed). /promote calls this.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, c, step, ok, info, fail } from './lib/args.mjs';
import { readText, writeText } from './lib/text.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const P = (rel) => path.join(ROOT, rel);

const args = parseArgs(process.argv.slice(2));
const type = args._[0];
const line = args._[1];
const section = (args.section && args.section !== true ? String(args.section) : 'Fixed').trim();
if (!['patch', 'minor', 'major'].includes(type) || !line) {
	fail('Usage: npm run bump -- <patch|minor|major> "<changelog line>" [--section Fixed]');
}

const pkg = JSON.parse(readFileSync(P('package.json'), 'utf8'));
if (pkg.name !== 'latz-starter') fail('bump-version is starter only. This is a client project.');

const current = pkg.version;
const headVersion = gitHeadVersion();
const appendMode = headVersion && headVersion !== current;

step('bump', appendMode ? `appending to the uncommitted ${current} entry` : `bumping ${current} (${type})`);

let newVersion = current;
if (!appendMode) {
	newVersion = bump(current, type);
	pkg.version = newVersion;
	writeFileSync(P('package.json'), JSON.stringify(pkg, null, '\t') + '\n');
	ok(`package.json ${current} -> ${newVersion}`);
	bumpLockfile(newVersion);
}

updateChangelog(appendMode ? current : newVersion, section, line, appendMode);
console.log('');
info('Review with git diff, then commit and push the starter yourself.');
console.log('');

// ════════════════════════════════════════════════════════════════════════════

function bump(v, kind) {
	const [x, y, z] = v.split('.').map(Number);
	if (kind === 'major') return `${x + 1}.0.0`;
	if (kind === 'minor') return `${x}.${y + 1}.0`;
	return `${x}.${y}.${z + 1}`;
}

function gitHeadVersion() {
	try {
		const out = execFileSync('git', ['show', 'HEAD:package.json'], { cwd: ROOT, encoding: 'utf8' });
		return JSON.parse(out).version;
	} catch {
		return null; // no git / no HEAD: treat as fresh bump
	}
}

function bumpLockfile(version) {
	const lockPath = P('package-lock.json');
	if (!existsSync(lockPath)) return;
	const lock = JSON.parse(readFileSync(lockPath, 'utf8'));
	lock.version = version;
	if (lock.packages && lock.packages['']) lock.packages[''].version = version;
	writeFileSync(lockPath, JSON.stringify(lock, null, '\t') + '\n');
	ok('package-lock.json version updated');
}

function updateChangelog(version, sec, text, append) {
	const rel = 'CHANGELOG.md';
	const { text: md, eol } = readText(P(rel));
	const entryHeader = `## ${version} (`;
	const bullet = `- ${text}`;

	if (append && md.includes(entryHeader)) {
		// Add the bullet under the right subsection of the existing top entry.
		const next = addBulletToEntry(md, version, sec, bullet);
		writeText(P(rel), next, eol);
		ok(`appended to CHANGELOG ${version} › ${sec}`);
		return;
	}

	// Fresh entry at the top (after the --- separator that follows the preamble).
	const date = new Date().toISOString().slice(0, 10);
	const entry = `## ${version} (${date})\n\n### ${sec}\n${bullet}\n`;
	const marker = '\n---\n';
	const idx = md.indexOf(marker);
	let next;
	if (idx === -1) {
		next = `${entry}\n${md}`;
	} else {
		const at = idx + marker.length;
		next = md.slice(0, at) + '\n' + entry + '\n' + md.slice(at).replace(/^\n+/, '');
	}
	writeText(P(rel), next, eol);
	ok(`CHANGELOG entry added for ${version}`);
}

// Insert bullet under "### <sec>" within the "## <version>" entry, creating the
// subsection if needed. Operates on the first (top) matching entry.
function addBulletToEntry(md, version, sec, bullet) {
	const lines = md.split('\n');
	const start = lines.findIndex((l) => l.startsWith(`## ${version} (`));
	if (start === -1) return md;
	let end = lines.findIndex((l, i) => i > start && l.startsWith('## '));
	if (end === -1) end = lines.length;
	// Find the subsection within [start, end).
	let secIdx = -1;
	for (let i = start; i < end; i++) if (lines[i].trim() === `### ${sec}`) secIdx = i;
	if (secIdx === -1) {
		// Add the subsection just before the next entry (or the trailing blank).
		let insertAt = end;
		while (insertAt > start && lines[insertAt - 1].trim() === '') insertAt--;
		lines.splice(insertAt, 0, '', `### ${sec}`, bullet);
	} else {
		// Append after the last bullet of this subsection.
		let insertAt = secIdx + 1;
		while (insertAt < end && (lines[insertAt].startsWith('- ') || lines[insertAt].trim() === '')) insertAt++;
		while (insertAt > secIdx + 1 && lines[insertAt - 1].trim() === '') insertAt--;
		lines.splice(insertAt, 0, bullet);
	}
	return lines.join('\n');
}
