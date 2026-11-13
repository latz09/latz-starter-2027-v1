#!/usr/bin/env node
// scripts/theme.mjs
// Turns a client's style guide, captured as docs/style-guide/tokens.json, into
// the project's themed foundation: it regenerates the /* @gen:* */ regions of
// tailwind.config.js, app/globals.css, app/layout.js and data/config/theme.js
// and nothing else. Pure Node, no dependencies. Deterministic: same tokens in,
// same files out, so it is safe to re-run.
//
//   npm run theme            apply docs/style-guide/tokens.json
//   npm run theme -- --init  write a blank tokens.json to fill in by hand
//   npm run theme -- --dry-run   show what would change, write nothing
//
// The /theme skill fills tokens.json from the style guide screenshots and
// pauses for review before this runs. Without Claude: run --init, fill the
// file, run it. Follows reference/style-guide-config-generator.md.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readText, writeText, replaceRegion, hasRegion } from './lib/text.mjs';
import { c, step, ok, warn, info, fail } from './lib/args.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (rel) => path.join(ROOT, rel);
const TOKENS = p('docs/style-guide/tokens.json');

const SLOTS = ['primary', 'secondary', 'accent', 'tertiary', 'dark', 'light'];
const CONSTANT_COLORS = [
	"transparent: 'transparent'",
	"current: 'currentColor'",
	"white: '#ffffff'",
	"black: '#000000'",
];
// Classes the starter ships. Every one must be defined or aliased, or
// components that use it render unstyled.
const STARTER_CLASSES = [
	'hero-title',
	'text-overline',
	'text-subheading',
	'text-paragraph',
	'text-caption',
	'text-button',
];
const FALLBACK_STACK = {
	sans: '...fontFamily.sans',
	serif: '...fontFamily.serif',
	mono: '...fontFamily.mono',
};

const args = process.argv.slice(2);
const DRY = args.includes('--dry-run');

if (args.includes('--init')) {
	initTokens();
	process.exit(0);
}

// ── Load + validate ─────────────────────────────────────────────────────────
if (!existsSync(TOKENS)) {
	fail(
		`No tokens file at docs/style-guide/tokens.json.\n  Run: npm run theme -- --init   then fill it in (or let /theme read the screenshots).`,
	);
}

let tokens;
try {
	tokens = JSON.parse(readFileSync(TOKENS, 'utf8'));
} catch (e) {
	fail(`tokens.json is not valid JSON: ${e.message}`);
}

const problems = [];
const flags = [];
validate(tokens, problems);
if (problems.length) {
	fail(`tokens.json has problems:\n${problems.map((x) => `  - ${x}`).join('\n')}`);
}

// Generation runs after all helpers are defined (see apply() at the bottom).

// ════════════════════════════════════════════════════════════════════════════

function validate(t, out) {
	if (!t.colors) out.push('no "colors"');
	else for (const s of SLOTS) {
		if (!t.colors[s]) out.push(`colors.${s} missing`);
		else if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(t.colors[s].hex || '')) out.push(`colors.${s}.hex is not a hex value`);
	}
	if (!SLOTS.includes(t.headingColor)) out.push(`headingColor must be one of ${SLOTS.join(', ')}`);
	if (!SLOTS.includes(t.accentColor)) out.push(`accentColor must be one of ${SLOTS.join(', ')}`);
	if (!t.fonts || !t.fonts.heading || !t.fonts.heading.family) out.push('fonts.heading.family missing');
	if (!t.radius) out.push('radius missing (e.g. "0.5rem")');
	if (!t.styles || !Object.keys(t.styles).length) out.push('no "styles"');
	else for (const [k, v] of Object.entries(t.styles)) {
		if (!v.size) out.push(`styles.${k}.size missing`);
		if (v.weight == null) out.push(`styles.${k}.weight missing`);
		if (v.lineHeight == null) out.push(`styles.${k}.lineHeight missing`);
	}
	// Every starter class defined or aliased (warn, not fatal).
	const defined = new Set(Object.keys(t.styles || {}));
	const aliased = new Set(Object.keys(t.aliases || {}));
	for (const cls of STARTER_CLASSES) {
		if (!defined.has(cls) && !aliased.has(cls)) {
			flags.push(`${c.red('.' + cls)} is neither a style nor an alias. Components using it will render unstyled. Add it to "aliases" in tokens.json.`);
		}
	}
	for (const [from, to] of Object.entries(t.aliases || {})) {
		if (!defined.has(to)) out.push(`alias ${from} -> ${to}, but ${to} is not a defined style`);
	}
}

// Px/rem helpers. All guide sizes are rem.
const rem = (v) => parseFloat(String(v).replace('rem', ''));
const round = (n, d = 3) => parseFloat(n.toFixed(d));

function lineHeight(v) {
	if (typeof v === 'number') return String(v);
	const s = String(v).trim();
	if (s === 'normal') return 'normal';
	if (s.endsWith('%')) return String(round(parseFloat(s) / 100, 3));
	return s;
}

// Fluid min ratio: headings taper (bigger = more shrink), body barely moves.
function minRatio(key) {
	if (/^h[1-6]$/.test(key)) return { h1: 0.55, h2: 0.58, h3: 0.62, h4: 0.66, h5: 0.7, h6: 0.72 }[key];
	if (key === 'hero-title') return 0.5;
	return 0.9; // body / UI utilities
}
function prefFactor(key) {
	return /^h[1-6]$/.test(key) || key === 'hero-title' ? 1.5 : 1.3;
}

function clampFor(key, style) {
	const max = rem(style.size);
	const min = style.min != null ? rem(style.min) : round(max * minRatio(key));
	if (min >= max) return `${max}rem`; // no range needed
	const pref = round(max * prefFactor(key), 2);
	if (style.min == null && /^h[1-6]$|hero-title/.test(key)) {
		flags.push(`${key}: fluid min set to ${min}rem (max ${max}rem). Override with "min" in tokens.json if you want a different floor.`);
	}
	return `clamp(${min}rem, ${pref}vw, ${max}rem)`;
}

// Which font variable a style uses. Single font: always --font-heading. Split:
// headings + hero-title on --font-heading, body/UI on --font-body, unless the
// style names one.
function fontVarFor(key, t) {
	const split = !!(t.fonts.body && t.fonts.body.family);
	if (!split) return 'var(--font-heading)';
	const named = t.styles[key]?.font;
	if (named === 'heading') return 'var(--font-heading)';
	if (named === 'body') return 'var(--font-body)';
	return /^h[1-6]$/.test(key) || key === 'hero-title' ? 'var(--font-heading)' : 'var(--font-body)';
}

function genColors(t) {
	const lines = SLOTS.map((s) => `\t\t\t${s}: '${t.colors[s].hex}', // ${t.colors[s].name || s}`);
	for (const con of CONSTANT_COLORS) lines.push(`\t\t\t${con},`);
	flags.push(`Slot mapping: ${SLOTS.map((s) => `${s}=${t.colors[s].name || t.colors[s].hex}`).join(', ')}`);
	return lines.join('\n');
}

function genFontFamily(t) {
	const split = !!(t.fonts.body && t.fonts.body.family);
	const hf = FALLBACK_STACK[t.fonts.heading.fallback] || FALLBACK_STACK.sans;
	if (!split) {
		flags.push(`Single-font mode: ${t.fonts.heading.family} everywhere.`);
		return `\t\t\tdefault: ['var(--font-heading)', ${hf}],`;
	}
	const bf = FALLBACK_STACK[t.fonts.body.fallback] || FALLBACK_STACK.sans;
	flags.push(`Split-font mode: headings ${t.fonts.heading.family}, body ${t.fonts.body.family}.`);
	return (
		`\t\t\tdefault: ['var(--font-body)', ${bf}],\n` +
		`\t\t\theading: ['var(--font-heading)', ${hf}],`
	);
}

function genRadius(t) {
	return [`\t\t\tnone: '0',`, `\t\t\tDEFAULT: '${t.radius}',`, `\t\t\tfull: '9999px',`].join('\n');
}

function genThemeColors(t) {
	flags.push(`--heading-color = ${t.headingColor}, --accent-color = ${t.accentColor}.`);
	return (
		`\t--heading-color: theme('colors.${t.headingColor}');\n` +
		`\t--accent-color: theme('colors.${t.accentColor}');`
	);
}

function genHeadings(t) {
	const present = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].filter((h) => t.styles[h]);
	const out = [];
	// Shared rule: color, family, text-flow. Weight + tracking are per-level.
	out.push(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((h) => `\t${h}`).join(',\n') + ' {');
	out.push(`\t\tcolor: var(--heading-color);`);
	out.push(`\t\tfont-family: var(--font-heading);`);
	out.push('');
	out.push(`\t\torphans: 2;`);
	out.push(`\t\twidows: 2;`);
	out.push(`\t\tword-break: normal;`);
	out.push(`\t\toverflow-wrap: break-word;`);
	out.push(`\t\ttext-wrap: pretty;`);
	out.push(`\t}`);
	for (const h of present) {
		const s = t.styles[h];
		out.push('');
		out.push(`\t${h} {`);
		out.push(`\t\tfont-size: ${clampFor(h, s)};`);
		out.push(`\t\tline-height: ${lineHeight(s.lineHeight)};`);
		out.push(`\t\tfont-weight: ${s.weight};`);
		if (s.letterSpacing != null) out.push(`\t\tletter-spacing: ${s.letterSpacing};`);
		out.push(`\t}`);
	}
	return out.join('\n');
}

function componentKeys(t) {
	// hero-title first, then the rest in tokens order, then aliases.
	const keys = Object.keys(t.styles).filter((k) => !/^h[1-6]$/.test(k));
	keys.sort((a, b) => (a === 'hero-title' ? -1 : b === 'hero-title' ? 1 : 0));
	return keys;
}

function ruleBody(key, style, t, { heroFlow = false } = {}) {
	const out = [];
	out.push(`\t\tcolor: var(--heading-color);`);
	out.push(`\t\tfont-family: ${fontVarFor(key, t)};`);
	out.push(`\t\tfont-size: ${clampFor(key, style)};`);
	out.push(`\t\tfont-weight: ${style.weight};`);
	out.push(`\t\tline-height: ${lineHeight(style.lineHeight)};`);
	if (style.letterSpacing != null) out.push(`\t\tletter-spacing: ${style.letterSpacing};`);
	if (style.uppercase) out.push(`\t\ttext-transform: uppercase;`);
	if (heroFlow) {
		out.push('');
		out.push(`\t\torphans: 2;`);
		out.push(`\t\twidows: 2;`);
		out.push(`\t\tword-break: normal;`);
		out.push(`\t\toverflow-wrap: break-word;`);
		out.push(`\t\ttext-wrap: pretty;`);
	}
	return out.join('\n');
}

function genTextClasses(t) {
	const blocks = [];
	for (const key of componentKeys(t)) {
		const s = t.styles[key];
		blocks.push(`\t.${key} {\n${ruleBody(key, s, t, { heroFlow: key === 'hero-title' })}\n\t}`);
	}
	// Starter aliases: duplicate the target's declarations under the old name.
	for (const [from, to] of Object.entries(t.aliases || {})) {
		const s = t.styles[to];
		blocks.push(
			`\t/* starter alias -> .${to}; delete if unused */\n` +
				`\t.${from} {\n${ruleBody(from, s, t, { heroFlow: from === 'hero-title' })}\n\t}`,
		);
		flags.push(`.${from} kept as a starter alias of .${to}.`);
	}
	return blocks.join('\n\n');
}

function genFontImport(t) {
	const split = !!(t.fonts.body && t.fonts.body.family);
	const faces = [['heading', t.fonts.heading, '--font-heading']];
	if (split) faces.push(['body', t.fonts.body, '--font-body']);

	const localImports = [];
	const googleFamilies = [];
	const consts = [];
	const varNames = [];

	for (const [role, font, cssVar] of faces) {
		const varName = role === 'heading' ? 'headingFont' : 'bodyFont';
		varNames.push(`${varName}.variable`);
		if (font.source === 'local') {
			const files = (font.files || []).map(
				(f) => `\t\t{ path: './fonts/${f.file}', weight: '${f.weight || '400'}', style: '${f.style || 'normal'}' }`,
			);
			localImports.push(`import localFont from 'next/font/local';`);
			consts.push(
				`const ${varName} = localFont({\n` +
					`\tsrc: [\n${files.join(',\n')},\n\t],\n` +
					`\tdisplay: 'swap',\n\tvariable: '${cssVar}',\n});`,
			);
			flags.push(`${font.family} is self-hosted: drop its .woff2 files in app/fonts/ (see tokens.json "files"). Check the license for client use.`);
		} else {
			const weights = font.weights || collectWeights(t, role, split);
			const styleProp = font.italic ? `\n\tstyle: ['normal', 'italic'],` : '';
			googleFamilies.push([font.family, varName, cssVar, weights, styleProp]);
		}
	}

	const lines = [];
	// Google imports: one `import { Fam } from 'next/font/google'` per family.
	for (const [family, , , ,] of googleFamilies) {
		lines.push(`import { ${jsFont(family)} } from 'next/font/google';`);
	}
	for (const imp of [...new Set(localImports)]) lines.push(imp);
	lines.push('');
	for (const [family, varName, cssVar, weights, styleProp] of googleFamilies) {
		lines.push(
			`const ${varName} = ${jsFont(family)}({\n` +
				`\tsubsets: ['latin'],\n` +
				`\tweight: [${weights.map((w) => `'${w}'`).join(', ')}],${styleProp}\n` +
				`\tdisplay: 'swap',\n\tvariable: '${cssVar}',\n});`,
		);
	}
	for (const con of consts) lines.push(con);
	lines.push('');
	if (varNames.length > 1) {
		// Split font: a template string joining both variables with a space.
		lines.push('const fontVars = `' + varNames.map((v) => '${' + v + '}').join(' ') + '`;');
	} else {
		lines.push(`const fontVars = ${varNames[0]};`);
	}
	return lines.join('\n');
}

// next/font/google export name is the family with spaces as underscores.
const jsFont = (family) => family.replace(/\s+/g, '_');

function collectWeights(t, role, split) {
	const ws = new Set();
	for (const [key, s] of Object.entries(t.styles)) {
		const isHeading = /^h[1-6]$/.test(key) || key === 'hero-title';
		const forThis = !split || (role === 'heading' ? isHeading : !isHeading);
		if (forThis && s.weight != null) ws.add(String(s.weight));
	}
	return [...ws].sort() || ['400'];
}

function genThemePreview(t) {
	const colors = SLOTS.map(
		(s) => `\t\t{ name: ${js(t.colors[s].name || cap(s))}, slot: '${s}' }`,
	);
	const order = [
		...['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
		...componentKeys(t),
	].filter((k) => t.styles[k]);
	// hero-title shown with the headings if present.
	const ordered = [];
	if (t.styles['hero-title']) ordered.push('hero-title');
	for (const k of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) if (t.styles[k]) ordered.push(k);
	for (const k of componentKeys(t)) if (k !== 'hero-title') ordered.push(k);

	const typ = ordered.map((k) => {
		const s = t.styles[k];
		const label = s.guideName || previewLabel(k);
		const tag = /^h[1-6]$/.test(k) ? k : k === 'hero-title' ? 'h1' : 'p';
		const className = /^h[1-6]$/.test(k) ? 'null' : `'${k}'`;
		return `\t\t{ label: ${js(label)}, tag: '${tag}', className: ${className}, sample: ${js(sampleFor(k, label))} }`;
	});
	return `\tcolors: [\n${colors.join(',\n')},\n\t],\n\ttypography: [\n${typ.join(',\n')},\n\t],`;
}

const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const js = (s) => JSON.stringify(s);
function previewLabel(k) {
	if (k === 'hero-title') return 'Hero Title';
	if (/^h[1-6]$/.test(k)) return k.toUpperCase();
	return k.replace(/^text-/, '').split('-').map(cap).join(' ');
}
function sampleFor(k, label) {
	if (k === 'hero-title') return 'Hero Title';
	if (/^h[1-6]$/.test(k)) return `Heading ${k.slice(1)}`;
	if (/button/.test(k)) return 'BUTTON TEXT';
	if (/overline/.test(k)) return 'OVERLINE TEXT';
	if (/caption/.test(k)) return 'This is caption text for small details';
	if (/subheading|callout|quote/.test(k)) return 'This is a subheading for additional context';
	if (/paragraph/.test(k)) return 'This is body text for longer paragraphs and general content, designed for comfortable reading at various screen sizes.';
	return label;
}

function initTokens() {
	const dir = path.dirname(TOKENS);
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
	if (existsSync(TOKENS)) fail('docs/style-guide/tokens.json already exists. Edit it, or delete it first.');
	const blank = {
		colors: Object.fromEntries(SLOTS.map((s) => [s, { name: '', hex: '#000000' }])),
		headingColor: 'dark',
		accentColor: 'secondary',
		fonts: {
			heading: { family: '', source: 'google', fallback: 'sans', italic: false },
			body: null,
		},
		radius: '0.5rem',
		styles: {
			h1: { guideName: 'H1', size: '6rem', weight: 600, lineHeight: '100%', letterSpacing: '-0.025rem' },
			'text-paragraph': { guideName: 'Paragraph', size: '1.25rem', weight: 400, lineHeight: '150%' },
			'text-button': { guideName: 'Button', size: '1rem', weight: 600, lineHeight: 'normal' },
		},
		aliases: {},
	};
	writeFileSync(TOKENS, JSON.stringify(blank, null, 2) + '\n');
	ok(`wrote ${path.relative(ROOT, TOKENS)}`);
	info('Fill in the six colors, fonts, radius and every guide type style, then: npm run theme');
}

// ── Run ─────────────────────────────────────────────────────────────────────
function apply() {
	const edits = [
		['tailwind.config.js', 'colors', genColors(tokens)],
		['tailwind.config.js', 'fontFamily', genFontFamily(tokens)],
		['tailwind.config.js', 'borderRadius', genRadius(tokens)],
		['app/globals.css', 'themeColors', genThemeColors(tokens)],
		['app/globals.css', 'headings', genHeadings(tokens)],
		['app/globals.css', 'textClasses', genTextClasses(tokens)],
		['app/layout.js', 'fontImport', genFontImport(tokens)],
		['data/config/theme.js', 'themePreview', genThemePreview(tokens)],
	];

	step('theme', DRY ? 'Dry run: nothing is written.' : 'Applying docs/style-guide/tokens.json');

	const byFile = new Map();
	for (const [file, region, body] of edits) {
		if (!byFile.has(file)) byFile.set(file, readText(p(file)));
		const current = byFile.get(file);
		if (!hasRegion(current.text, region)) {
			fail(`${file}: missing /* @gen:${region} */ markers. Was it hand-edited? Restore them or re-clone the file from the starter.`);
		}
		byFile.set(file, { ...current, text: replaceRegion(current.text, region, body) });
	}

	for (const [file, { text, eol }] of byFile) {
		if (DRY) info(`would update ${file}`);
		else {
			writeText(p(file), text, eol);
			ok(`updated ${file}`);
		}
	}

	console.log(`\n${c.bold('Check these:')}`);
	for (const f of flags) console.log(`  ${c.yellow('•')} ${f}`);
	console.log(
		`\n${c.dim('Colors were read off a screenshot: confirm the six hexes.')}\n` +
			`${c.dim('Then rebuild and open')} http://localhost:3000/design`,
	);
}

apply();
