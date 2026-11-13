// scripts/lib/args.mjs
// Minimal argv parser shared by the Latz scripts. Mirrors new-client.mjs:
// `--key value` or boolean `--flag`, plus bare positionals in `_`.
//
//   parseArgs(['home', 'landing-hero', '--dry-run'])
//   → { _: ['home', 'landing-hero'], 'dry-run': true }

export function parseArgs(argv) {
	const args = { _: [] };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (!a.startsWith('--')) {
			args._.push(a);
			continue;
		}
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

// Tiny ANSI helpers + step/ok/warn/fail, matching new-client.mjs so every
// script reads the same in the terminal.
export const c = {
	bold: (s) => `\x1b[1m${s}\x1b[0m`,
	green: (s) => `\x1b[32m${s}\x1b[0m`,
	yellow: (s) => `\x1b[33m${s}\x1b[0m`,
	red: (s) => `\x1b[31m${s}\x1b[0m`,
	dim: (s) => `\x1b[2m${s}\x1b[0m`,
};

export const step = (n, msg) => console.log(`\n${c.bold(`[${n}]`)} ${msg}`);
export const ok = (msg) => console.log(`    ${c.green('✓')} ${msg}`);
export const warn = (msg) => console.log(`    ${c.yellow('!')} ${msg}`);
export const info = (msg) => console.log(`    ${c.dim(msg)}`);
export const fail = (msg) => {
	console.error(`\n${c.red('✗')} ${msg}\n`);
	process.exit(1);
};
