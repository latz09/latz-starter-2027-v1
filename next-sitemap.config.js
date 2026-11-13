// next-sitemap.config.js
module.exports = {
	siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.latzwebdesign.com',
	generateRobotsTxt: true,
	exclude: ['/opengraph-image.jpg', '/page-4'],
	robotsTxtOptions: {
		policies: [
			{
				userAgent: '*',
				allow: '/',
				disallow: ['/opengraph-image.jpg', '/page-4'],
			},
		],
	},
};
