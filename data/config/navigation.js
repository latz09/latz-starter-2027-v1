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

// True once a Sanity project ID is set (new-client.mjs writes it to
// .env.local). Until then the nav uses PLACEHOLDER_NAV_LINKS. Once connected,
// getNavLinks.js still falls back to the placeholders while the Navigation
// document is empty, so there's nothing to flip by hand.
// Read by getNavLinks.js (server-only). Kept here so the client-safe and
// server-only files agree on one value.
export const USE_CMS = Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);