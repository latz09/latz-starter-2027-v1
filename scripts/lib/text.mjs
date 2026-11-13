// scripts/lib/text.mjs
// File read/write that preserves the file's existing newline style (so a
// script never flips a whole file to LF on Windows and blows up a diff), plus
// marker-region replacement used by theme.mjs and the scaffold scripts.

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

// Detect the dominant newline. Default to LF (the repo is LF today).
export const detectEol = (s) => (s.includes('\r\n') ? '\r\n' : '\n');

// Read a file as LF-normalized text, remembering its real EOL for writeText.
export function readText(file) {
	const raw = readFileSync(file, 'utf8');
	return { text: raw.replace(/\r\n/g, '\n'), eol: detectEol(raw) };
}

// Write LF-normalized text back in the file's original newline style.
export function writeText(file, text, eol = '\n') {
	const out = eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text;
	writeFileSync(file, out);
}

// ── Marker regions ─────────────────────────────────────────────────────────
// Generated regions are wrapped in paired comments that work in both JS and
// CSS:  /* @gen:NAME start */ ... /* @gen:NAME end */
// replaceRegion swaps the body between them, keeping the marker lines and the
// end marker's indentation intact. Idempotent: same body in, same file out.

export const startMarker = (name) => `/* @gen:${name} start */`;
export const endMarker = (name) => `/* @gen:${name} end */`;

export function hasRegion(text, name) {
	return text.includes(startMarker(name)) && text.includes(endMarker(name));
}

export function replaceRegion(text, name, body) {
	const start = startMarker(name);
	const end = endMarker(name);
	const si = text.indexOf(start);
	if (si === -1) throw new Error(`marker not found: ${start}`);
	const afterStart = si + start.length;
	const ei = text.indexOf(end, afterStart);
	if (ei === -1) throw new Error(`marker not found: ${end}`);
	// Preserve whatever indentation precedes the end marker on its own line.
	const lineStart = text.lastIndexOf('\n', ei) + 1;
	const endIndent = text.slice(lineStart, ei);
	return text.slice(0, afterStart) + '\n' + body + '\n' + endIndent + text.slice(ei);
}

// Read the current body between a region's markers (no markers, trimmed ends).
export function readRegion(text, name) {
	const start = startMarker(name);
	const end = endMarker(name);
	const si = text.indexOf(start);
	const ei = text.indexOf(end, si + start.length);
	if (si === -1 || ei === -1) return null;
	return text.slice(si + start.length, ei).replace(/^\n/, '').replace(/\n[ \t]*$/, '');
}

export { existsSync };
