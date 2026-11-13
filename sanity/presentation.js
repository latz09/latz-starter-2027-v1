// sanity/presentation.js
// Tells the Presentation tool (live preview) which page shows which document.
//
//   mainDocuments: visiting a route in the preview opens its document in the
//                  editor panel next to it.
//   locations:     the "Used on N pages" banner on a document, with links that
//                  open those pages in the preview.
//
// Add one entry to PAGES per singleton page. /schema keeps this in sync.
// Collections with detail routes (e.g. /projects/[slug]) go in
// mainDocuments with a $slug filter, see the commented example below.

import { defineDocuments, defineLocations } from 'sanity/presentation';

const PAGES = [
	{ type: 'homePage', title: 'Home', route: '/' },
	{ type: 'aboutPage', title: 'About', route: '/about' },
	{ type: 'servicesPage', title: 'Services', route: '/services' },
	{ type: 'contactPage', title: 'Contact', route: '/contact' },
];

// Site-wide documents that show on every page.
const GLOBAL_TYPES = [
	{ type: 'navigation', title: 'Navigation' },
	{ type: 'seoSettings', title: 'SEO Settings' },
];

export const mainDocuments = defineDocuments([
	...PAGES.map(({ type, route }) => ({
		route,
		filter: `_type == "${type}" && _id == "${type}"`,
	})),
	// Dynamic route example:
	// { route: '/projects/:slug', filter: `_type == "project" && slug.current == $slug` },
]);

export const locations = {
	...Object.fromEntries(
		PAGES.map(({ type, title, route }) => [
			type,
			defineLocations({ locations: [{ title, href: route }] }),
		]),
	),
	...Object.fromEntries(
		GLOBAL_TYPES.map(({ type, title }) => [
			type,
			defineLocations({
				locations: [{ title: `${title} (every page)`, href: '/' }],
			}),
		]),
	),
};
