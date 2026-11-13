// scripts/check-icon.mjs
// Checks that icons exist in the installed @sanity/icons before you import them.
//
//   node scripts/check-icon.mjs Cog Home EarthGlobe
//   node scripts/check-icon.mjs CogIcon        (the "Icon" suffix is optional)
//
// @sanity/icons v5 has no named exports at the package root. Every icon is its
// own subpath: import { CogIcon } from '@sanity/icons/Cog'. This prints the
// exact import line for each name that exists and exits 1 if any are missing.

import { readFileSync } from 'node:fs';

let exportsMap;
try {
	const pkgUrl = new URL('../node_modules/@sanity/icons/package.json', import.meta.url);
	exportsMap = JSON.parse(readFileSync(pkgUrl, 'utf8')).exports;
} catch {
	console.error('Could not read node_modules/@sanity/icons. Run npm ci first.');
	process.exit(1);
}

const available = new Set(
	Object.keys(exportsMap)
		.filter((key) => key.startsWith('./') && key !== './package.json')
		.map((key) => key.slice(2)),
);

const names = process.argv.slice(2);
if (names.length === 0) {
	console.log(`${available.size} icons available. Pass names to check them, e.g. Cog Home`);
	process.exit(0);
}

let missing = 0;
for (const input of names) {
	const name = input.replace(/Icon$/, '');
	if (available.has(name)) {
		console.log(`OK       import { ${name}Icon } from '@sanity/icons/${name}'`);
	} else {
		missing += 1;
		const close = [...available]
			.filter((a) => a.toLowerCase().includes(name.toLowerCase().slice(0, 4)))
			.slice(0, 5);
		console.log(`MISSING  ${input}${close.length ? `   (similar: ${close.join(', ')})` : ''}`);
	}
}
process.exit(missing ? 1 : 0);
