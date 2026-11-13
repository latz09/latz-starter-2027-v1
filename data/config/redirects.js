// data/config/redirects.js
// Old URL → new URL, for rebuilds of an existing site. Wired into
// next.config.mjs, so they run at the edge before any page renders.
//
// Fill this from the old site's sitemap or Google Search Console before
// launch, so existing search rankings and bookmarks carry over.
//
//   permanent: true  → 308 (search engines move rankings to the new URL)
//   permanent: false → 307 (temporary, rankings stay on the old URL)
//
// `source` supports params and wildcards:
//   { source: '/old-blog/:slug', destination: '/news/:slug', permanent: true }
//   { source: '/services.html', destination: '/services', permanent: true }

export const redirects = [
	// { source: '/about-us', destination: '/about', permanent: true },
];
