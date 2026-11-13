// scripts/lib/names.mjs
// Name conversions shared by the Latz scripts. One place so a page slug, a
// schema type, a component name and a query name are always derived the same
// way from the same string.

// 'Acme Cleaning Co' / 'agendas_minutes' -> 'agendas-cleaning-co' style slug.
export const slugify = (s) =>
	String(s)
		.toLowerCase()
		.replace(/['’]/g, '')
		.replace(/&/g, 'and')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');

// 'agendas-minutes' -> 'agendasMinutes'
export const toCamel = (slug) =>
	slugify(slug).replace(/-([a-z0-9])/g, (_, ch) => ch.toUpperCase());

// 'agendas-minutes' -> 'AgendasMinutes'
export const toPascal = (slug) => {
	const camel = toCamel(slug);
	return camel.charAt(0).toUpperCase() + camel.slice(1);
};

// 'agendas-minutes' -> 'Agendas Minutes'
export const toTitle = (slug) =>
	slugify(slug)
		.split('-')
		.filter(Boolean)
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(' ');

// ── Page names ───────────────────────────────────────────────────────────
// A page slug drives: the route, the singleton schema type, the query file.
//   'home'            -> homePage  / FETCH_HOME_PAGE_QUERY  / route '/'
//   'agendas-minutes' -> agendasMinutesPage / FETCH_AGENDAS_MINUTES_PAGE_QUERY

export const pageType = (slug) => `${toCamel(slug)}Page`;
export const pageRoute = (slug) => (slug === 'home' ? '/' : `/${slugify(slug)}`);
export const pageTitle = (slug) => (slug === 'home' ? 'Home' : toTitle(slug));

// Query const + file name, e.g. FETCH_AGENDAS_MINUTES_PAGE_QUERY.
export const pageQueryName = (slug) =>
	`FETCH_${slugify(slug).replace(/-/g, '_').toUpperCase()}_PAGE_QUERY`;

// ── Section names ────────────────────────────────────────────────────────
// A section name drives: the schema group, the component, the file, the
// /section argument.
//   'landing-hero' -> group landingHero / <LandingHero/> / LandingHero.js

export const sectionGroup = (name) => toCamel(name);
export const sectionComponent = (name) => toPascal(name);

// Section names that would collide with schema fields or groups.
export const RESERVED_SECTIONS = new Set(['title', 'seo']);
