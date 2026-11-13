// Per-project: routes that need light-on-dark nav styling
export const DARK_NAV_ROUTES = ['/about'];

// Placeholder nav links for display/design purposes before this project is
// wired to the CMS. isButton: true marks the CTA link.
export const PLACEHOLDER_NAV_LINKS = [
	{ label: 'Home', url: '/', isButton: false },
	{ label: 'About', url: '/about', isButton: false },
	{ label: 'Services', url: '/services', isButton: false },
	{ label: 'Contact', url: '/contact', isButton: true },
];

// Flip to true once Sanity is set up and FETCH_NAVIGATION_QUERY has real
// content. Read by getNavLinks.js (server-only) — kept here so both the
// client-safe and server-only files agree on one value.
export const USE_CMS = false;