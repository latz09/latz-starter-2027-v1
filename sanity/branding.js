// sanity/branding.js
// PER-CLIENT: the only Studio file that changes between clients.
// new-client.mjs fills in studioTitle. Everything else is a deliberate edit.

export const branding = {
	// Shown in the Studio navbar and browser tab, e.g. 'C&J Custom Rods'
	studioTitle: 'CLIENT_NAME',
	studioSubtitle: 'Powered by Latz Web Design',

	// Small logo in the Studio navbar. Drop the file in public/ and point at it.
	// Leave as-is to show the placeholder monogram.
	logoUrl: '/cms/client-logo.svg',

	// The per-client "How to edit your website" HTML page, linked from the
	// help popup in the Studio footer (sanity/components/CustomLayout.js).
	// Lives in public/ and is noindexed + excluded from the sitemap.
	cmsGuideUrl: '/cms-guide.html',

	// Studio colors. These are Latz Web Design's Studio colors, not the
	// client's site colors. Same for every client unless there's a reason.
	colors: {
		primary: '#18a1ad',
		dark: '#111827',
		light: '#f9fafb',
		gray: '#6b7280',
		positive: '#779e43',
		caution: '#f59e0b',
		critical: '#ef4444',
	},

	support: {
		email: 'jordan@latzwebdesign.com',
		siteUrl: 'https://latzwebdesign.com',
	},
};
