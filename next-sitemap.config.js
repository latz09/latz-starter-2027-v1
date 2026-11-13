// next-sitemap.config.js
// Runs after every build (postbuild). Output (public/sitemap*.xml,
// public/robots.txt) is gitignored: it's regenerated each time.

// Never in the sitemap, disallowed in robots.txt. Keep in sync with
// NOINDEX_PREFIXES in proxy.js.
const NOINDEX_PATHS = ['/latz-studio', '/design', '/cms-guide.html', '/api'];

/** @type {import('next-sitemap').IConfig} */
module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.example.com',
	generateRobotsTxt: true,
	exclude: [
		'/opengraph-image.jpg',
		...NOINDEX_PATHS.flatMap((path) => [path, `${path}/*`]),
	],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: NOINDEX_PATHS,
			},
		],
	},
};
