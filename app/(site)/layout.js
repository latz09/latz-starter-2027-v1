// app/(site)/layout.js
// Layout for every public page. The (site) folder is a route group: it adds
// nothing to the URL, it only keeps this layout (and globals.css / Tailwind
// preflight) away from the embedded Studio at /latz-studio.

import '@/app/globals.css';
import SiteShell from '@/components/layout/SiteShell';
import { fetchSeoSettings } from '@/utils/cms/fetchSeoSettings';

export async function generateMetadata() {
	const seo = await fetchSeoSettings();
	if (!seo?.siteUrl) return {};

	return {
		metadataBase: new URL(seo.siteUrl),
		applicationName: seo.siteName,
		title: {
			default: seo.defaultTitle,
			template: seo.titleTemplate,
		},
		description: seo.defaultDescription,
		keywords: seo.keywords,
		icons: { icon: '/favicon.ico' },
		verification: {
			google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
		},
		openGraph: {
			title: seo.defaultTitle,
			description: seo.defaultDescription,
			url: seo.siteUrl,
			siteName: seo.siteName,
			images: [{ url: seo.ogImage, width: 1200, height: 630 }],
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: seo.defaultTitle,
			description: seo.defaultDescription,
			...(seo.twitterHandle && { creator: seo.twitterHandle }),
			images: [seo.ogImage],
		},
	};
}

export default function SiteLayout({ children }) {
	return <SiteShell>{children}</SiteShell>;
}
