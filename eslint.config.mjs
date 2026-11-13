import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

export default defineConfig([
	...nextVitals,
	{
		// Sanity schemas are `export default { ... }` by house convention.
		files: ['sanity/schemaTypes/**/*.js'],
		rules: { 'import/no-anonymous-default-export': 'off' },
	},
	globalIgnores(['.next/**', 'out/**', 'build/**', 'node_modules/**', 'public/**']),
]);
