// scripts/lib/seed.mjs
// The logic behind `npm run seed`: read docs/seed/*.json, normalize it into
// Sanity documents, plan what is safe to write (fill-empty by default), and apply
// it through a tiny HTTP client (plain fetch, no dependency). Everything here is
// pure or takes its client as an argument, so it can be tested with a stub.
//
// Rules (see docs/README.md "Seed files" and .claude/skills/schema/seed.md):
//   - Fill-empty only: a field is written only if the document's field is empty.
//     Arrays are atomic: an array that already has anything in it is left alone.
//   - --force overwrites the fields present in the seed file. It never deletes a
//     field the file doesn't mention.
//   - Published and draft are planned independently with the same rule, and every
//     draft the seed touches is reported by name.
//   - Images are skipped in this version ({ "$image": "..." } markers are counted).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { pageType } from './names.mjs';

// Underscore keys that are real Sanity fields, not notes.
const SYSTEM_KEYS = new Set(['_type', '_id', '_key', '_ref', '_weak']);
// Underscore keys Sanity adds that never count as "content".
const META_KEYS = new Set(['_type', '_key', '_id', '_createdAt', '_updatedAt', '_rev']);
// Keys that exist inside Sanity's own value objects, not in our schema files.
const BUILTIN_KEYS = new Set(['current', 'asset', 'hotspot', 'crop']);
const FIELD_RE = /^[A-Za-z][A-Za-z0-9_]*$/;

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

// ── Emptiness ───────────────────────────────────────────────────────────────
// undefined/null, a blank string, [] and an object with no non-meta content are
// empty. 0 and false are values. `_ref` counts as content (a reference is not empty).
export function isEmpty(v) {
	if (v === undefined || v === null) return true;
	if (typeof v === 'string') return v.trim() === '';
	if (Array.isArray(v)) return v.length === 0;
	if (isPlainObject(v)) return Object.entries(v).every(([k, val]) => META_KEYS.has(k) || isEmpty(val));
	return false;
}

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ── .env.local (read by the script itself; Claude never reads .env files) ───
export function parseEnv(text) {
	const out = {};
	for (const line of String(text || '').split(/\r?\n/)) {
		const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
		if (m) out[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
	}
	return out;
}

export function loadEnv(root) {
	const file = path.join(root, '.env.local');
	const fromFile = existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {};
	// A real environment variable wins over the file.
	const pick = (k) => process.env[k] || fromFile[k] || '';
	return {
		projectId: pick('NEXT_PUBLIC_SANITY_PROJECT_ID'),
		dataset: pick('NEXT_PUBLIC_SANITY_DATASET') || 'production',
		token: pick('SANITY_API_TOKEN'),
		hasEnvFile: existsSync(file),
	};
}

// apiVersion lives in sanity/env.js (single source for the Studio and the site).
export function readApiVersion(root) {
	try {
		const m = readFileSync(path.join(root, 'sanity/env.js'), 'utf8').match(/apiVersion\s*=\s*['"](v?\d{4}-\d{2}-\d{2})['"]/);
		if (m) return m[1].replace(/^v/, '');
	} catch {}
	return '2025-02-19';
}

// ── Schema scan (to catch misspelled field names) ───────────────────────────
// Schema files are JSX-ish ESM that Node can't import, so read them as text.
// A file's document type is its first `name: '...'`; the field names it may use
// are every `name: '...'` in the file plus those in schemaTypes/partials/.
export function scanSchemas(root) {
	const dir = path.join(root, 'sanity/schemaTypes');
	const types = new Map();
	if (!existsSync(dir)) return types;
	const NAME_RE = /name:\s*['"]([A-Za-z0-9_]+)['"]/g;
	const namesIn = (text) => [...text.matchAll(NAME_RE)].map((m) => m[1]);

	const partialNames = new Set();
	const partialsDir = path.join(dir, 'partials');
	if (existsSync(partialsDir)) {
		for (const f of readdirSync(partialsDir).filter((n) => n.endsWith('.js'))) {
			namesIn(readFileSync(path.join(partialsDir, f), 'utf8')).forEach((n) => partialNames.add(n));
		}
	}
	for (const f of readdirSync(dir).filter((n) => n.endsWith('.js') && n !== 'index.js')) {
		const text = readFileSync(path.join(dir, f), 'utf8');
		const names = namesIn(text);
		if (!names.length) continue;
		types.set(names[0], { file: `sanity/schemaTypes/${f}`, names: new Set([...names, ...partialNames]) });
	}
	return types;
}

// ── Normalize one raw document from a seed file ─────────────────────────────
// Returns { doc, notes, images, unknown }.
//   notes:   [{ path, text }]   `_todo` / `_note` style keys (stripped)
//   images:  [{ path, source }] { "$image": "..." } markers (stripped, not uploaded)
//   unknown: [path]             keys not in this type's schema (stripped, not written)
export function normalizeDoc(raw, { type, id, knownNames }) {
	const notes = [];
	const images = [];
	const unknown = [];
	const errors = [];

	const walk = (value, p) => {
		if (Array.isArray(value)) {
			const items = [];
			value.forEach((item, i) => {
				const itemPath = `${p}[${i}]`;
				let out = walk(item, itemPath);
				if (isPlainObject(out) && !out._key) out = { ...out, _key: keyFor(p, i) };
				if (out !== undefined) items.push(out);
			});
			return items;
		}
		if (!isPlainObject(value)) return value;

		// Image marker: skipped in this version. Sibling keys (alt) still seed.
		if ('$image' in value) {
			images.push({ path: p, source: String(value.$image) });
			const rest = { ...value };
			delete rest.$image;
			const keys = Object.keys(rest).filter((k) => !k.startsWith('_'));
			return keys.length ? walk(rest, p) : undefined;
		}
		// Shorthands: { current } is a slug, { _ref } is a reference.
		const keys = Object.keys(value);
		if (keys.length === 1 && keys[0] === 'current') return { _type: 'slug', current: value.current };
		if (keys.length && keys.every((k) => k === '_ref' || k === '_weak')) return { _type: 'reference', ...value };

		const out = {};
		for (const [k, v] of Object.entries(value)) {
			if (k.startsWith('_') && !SYSTEM_KEYS.has(k)) {
				if (typeof v === 'string' && v.trim()) notes.push({ path: p || '(document)', text: `${k.replace(/^_/, '')}: ${v}` });
				continue;
			}
			if (!k.startsWith('_') && !FIELD_RE.test(k)) {
				errors.push(`${p ? p + '.' : ''}${k}: field names must be letters, numbers and underscores`);
				continue;
			}
			const childPath = p ? `${p}.${k}` : k;
			if (!k.startsWith('_') && knownNames && !knownNames.has(k) && !BUILTIN_KEYS.has(k)) {
				unknown.push(childPath);
				continue;
			}
			const child = walk(v, childPath);
			if (child === undefined) continue;
			// An incoming empty value never overwrites and is never written.
			if (!k.startsWith('_') && isEmpty(child)) continue;
			out[k] = child;
		}
		return out;
	};

	const body = walk(raw, '');
	const doc = { ...(isPlainObject(body) ? body : {}), _id: id, _type: type };
	return { doc, notes, images, unknown, errors };
}

function keyFor(arrayPath, i) {
	return createHash('sha1').update(`${arrayPath}[${i}]`).digest('hex').slice(0, 12);
}

// ── Load docs/seed/*.json ───────────────────────────────────────────────────
// A page file (object, named for a page slug) needs no _type: home.json is a
// homePage with _id homePage. Any other object needs _type (and defaults _id to
// _type, a singleton). A top-level array is a list of documents, each with _type
// and _id. Files starting with `_` are ignored. Returns { files, problems }.
export function loadSeedFiles(root, { only = [] } = {}) {
	const dir = path.join(root, 'docs/seed');
	const problems = [];
	const files = [];
	if (!existsSync(dir)) return { files, problems, dirMissing: true };

	const schemas = scanSchemas(root);
	const names = readdirSync(dir)
		.filter((n) => /\.json$/i.test(n) && !n.startsWith('_'))
		.map((n) => n.replace(/\.json$/i, ''))
		.sort();

	for (const wanted of only) {
		if (!names.includes(wanted)) problems.push(`no docs/seed/${wanted}.json (found: ${names.join(', ') || 'none'})`);
	}
	for (const name of names) {
		if (only.length && !only.includes(name)) continue;
		const rel = `docs/seed/${name}.json`;
		let json;
		try {
			json = JSON.parse(readFileSync(path.join(dir, `${name}.json`), 'utf8'));
		} catch (e) {
			problems.push(`${rel}: invalid JSON (${e.message})`);
			continue;
		}
		const items = Array.isArray(json) ? json : [json];
		const docs = [];
		items.forEach((raw, i) => {
			const where = Array.isArray(json) ? `${rel} item ${i + 1}` : rel;
			if (!isPlainObject(raw)) return problems.push(`${where}: expected an object`);
			const guessed = Array.isArray(json) ? undefined : pageType(name);
			const type = raw._type || (guessed && [...schemas.keys()].includes(guessed) ? guessed : undefined);
			if (!type) {
				return problems.push(`${where}: needs "_type"${Array.isArray(json) ? ' and "_id"' : ` (no ${pageType(name)} schema to infer it from)`}`);
			}
			const id = raw._id || (Array.isArray(json) ? undefined : type);
			if (!id) return problems.push(`${where}: list items need an "_id" (a stable id keeps re-runs from duplicating)`);
			const schema = schemas.get(type);
			if (!schema) return problems.push(`${where}: no document type "${type}" in sanity/schemaTypes/`);
			const n = normalizeDoc(raw, { type, id, knownNames: schema.names });
			n.errors.forEach((e) => problems.push(`${where}: ${e}`));
			docs.push({ ...n, id, type, where });
		});
		files.push({ name, rel, docs });
	}
	return { files, problems };
}

// ── Plan one target (published or draft) ────────────────────────────────────
// existing: the document as it is in Sanity, or null. Returns
//   { mode: 'create'|'patch'|'none', set, fill: [paths], overwrite: [paths], kept: [paths] }
export function planTarget(incoming, existing, { force = false } = {}) {
	const { _id, _type, ...fields } = incoming;
	const fill = [];
	const overwrite = [];
	const kept = [];
	const set = {};

	if (!existing) {
		leaves(fields, '').forEach((l) => fill.push(l));
		return { mode: fill.length ? 'create' : 'none', set: fields, fill, overwrite, kept };
	}

	const walk = (inc, ex, p) => {
		for (const [k, v] of Object.entries(inc)) {
			if (k.startsWith('_') && k !== '_ref') continue;
			const cp = p ? `${p}.${k}` : k;
			const e = ex?.[k];
			if (isPlainObject(v) && !('_type' in v && (v._type === 'slug' || v._type === 'reference'))) {
				if (isEmpty(e) || !isPlainObject(e)) {
					if (!isEmpty(e) && !force) { leaves(v, cp).forEach((l) => kept.push(l)); continue; }
					set[cp] = v;
					leaves(v, cp).forEach((l) => (isEmpty(e) ? fill : overwrite).push(l));
				} else walk(v, e, cp);
			} else {
				const label = Array.isArray(v) ? `${cp} (${v.length} item${v.length === 1 ? '' : 's'})` : cp;
				if (isEmpty(e)) {
					set[cp] = v;
					fill.push(label);
				} else if (force && !deepEqual(e, v)) {
					set[cp] = v;
					overwrite.push(label);
				} else kept.push(label);
			}
		}
	};
	walk(fields, existing, '');
	return { mode: Object.keys(set).length ? 'patch' : 'none', set, fill, overwrite, kept };
}

// Flatten a value to the field paths it would write (arrays count as one field).
function leaves(value, base) {
	if (Array.isArray(value)) return [`${base} (${value.length} item${value.length === 1 ? '' : 's'})`];
	if (isPlainObject(value)) {
		if (value._type === 'slug' || value._type === 'reference') return [base];
		const out = Object.entries(value)
			.filter(([k]) => !k.startsWith('_'))
			.flatMap(([k, v]) => leaves(v, base ? `${base}.${k}` : k));
		return out.length ? out : [base];
	}
	return [base];
}

// ── Plan every document ─────────────────────────────────────────────────────
// existingById: Map of _id -> document (published ids and drafts.<id> both).
export function planDocument(d, existingById, { force = false } = {}) {
	const published = existingById.get(d.id) || null;
	const draft = existingById.get(`drafts.${d.id}`) || null;
	const pub = planTarget(d.doc, published, { force });
	const drf = draft ? planTarget({ ...d.doc, _id: `drafts.${d.id}` }, draft, { force }) : null;
	return {
		id: d.id,
		type: d.type,
		published: { ...pub, exists: !!published, rev: published?._rev },
		draft: drf ? { ...drf, exists: true, id: `drafts.${d.id}`, rev: draft._rev } : null,
	};
}

// Turn a plan into Sanity mutations (one transaction per document).
export function buildMutations(plan, d) {
	const muts = [];
	const p = plan.published;
	if (p.mode === 'create') muts.push({ createIfNotExists: d.doc });
	if (p.mode === 'patch') muts.push({ patch: { id: plan.id, ifRevisionID: p.rev, set: p.set } });
	if (plan.draft && plan.draft.mode === 'patch') {
		muts.push({ patch: { id: plan.draft.id, ifRevisionID: plan.draft.rev, set: plan.draft.set } });
	}
	return muts;
}

// ── HTTP client (plain fetch, no dependency) ────────────────────────────────
// Reads use perspective=raw so drafts are visible whatever the API default is.
export function createSanityClient({ projectId, dataset, token, apiVersion, baseUrl, fetchImpl = fetch }) {
	const base = `${(baseUrl || `https://${projectId}.api.sanity.io`).replace(/\/$/, '')}/v${String(apiVersion).replace(/^v/, '')}`;
	const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

	// Network failures (offline, DNS, proxy) otherwise surface as a bare "fetch failed".
	const send = async (url, init, what) => {
		try {
			return await fetchImpl(url, init);
		} catch (e) {
			throw new Error(`${what} failed: could not reach Sanity (${e?.cause?.code || e?.cause?.message || e.message}). Check your connection, or use --dry-run --offline to check the files only.`);
		}
	};

	const fail = async (res, what) => {
		let detail = '';
		try {
			const body = await res.json();
			detail = body?.error?.description || body?.message || body?.error || JSON.stringify(body).slice(0, 300);
		} catch {}
		const hint = res.status === 401 || res.status === 403 ? ' (is SANITY_API_TOKEN an Editor token for this project?)' : '';
		throw new Error(`${what} failed: HTTP ${res.status}${detail ? ` ${detail}` : ''}${hint}`);
	};

	return {
		async fetchDocs(ids) {
			const qs = new URLSearchParams({ query: '*[_id in $ids]', $ids: JSON.stringify(ids), perspective: 'raw' });
			const res = await send(`${base}/data/query/${dataset}?${qs}`, { headers }, 'Reading existing documents');
			if (!res.ok) await fail(res, 'Reading existing documents');
			const body = await res.json();
			return body.result || [];
		},
		async mutate(mutations) {
			const res = await send(
				`${base}/data/mutate/${dataset}?returnIds=true&visibility=sync`,
				{ method: 'POST', headers, body: JSON.stringify({ mutations }) },
				'Writing documents',
			);
			if (!res.ok) await fail(res, 'Writing documents');
			return res.json();
		},
	};
}

// ── Run ─────────────────────────────────────────────────────────────────────
// client is null for --offline (every document is treated as not existing).
// Returns { results, drafts, images, notes, unknown, written, problems }.
export async function runSeed({ files, client, force = false, dryRun = true }) {
	const all = files.flatMap((f) => f.docs.map((d) => ({ ...d, file: f.rel })));
	const existingById = new Map();
	if (client && all.length) {
		const ids = all.flatMap((d) => [d.id, `drafts.${d.id}`]);
		for (const doc of await client.fetchDocs(ids)) existingById.set(doc._id, doc);
	}

	const results = [];
	let written = 0;
	for (const d of all) {
		const plan = planDocument(d, existingById, { force });
		const muts = buildMutations(plan, d);
		let applied = false;
		if (!dryRun && muts.length) {
			await client.mutate(muts);
			applied = true;
			written++;
		}
		results.push({ d, plan, muts, applied });
	}
	return {
		results,
		drafts: results.filter((r) => r.plan.draft && r.plan.draft.mode === 'patch').map((r) => r.plan.draft.id),
		images: all.flatMap((d) => d.images.map((i) => ({ doc: d.id, ...i }))),
		notes: all.flatMap((d) => d.notes.map((n) => ({ doc: d.id, ...n }))),
		unknown: all.flatMap((d) => d.unknown.map((u) => ({ doc: d.id, path: u }))),
		written,
	};
}
