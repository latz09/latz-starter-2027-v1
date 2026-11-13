// utils/seo/buildPageMetadata.js
// The `BPM` helper every page's generateMetadata calls.
//
//   Static page:   BPM({ slug: '/about', query: Q })
//   Dynamic route: BPM({ slug: `/projects/${slug}`, query: Q, params: { slug } })
//
// Handles both query shapes: a plain page document ({ seo, ... }) and a
// compound query ({ page: { seo, ... }, <collection>: [...] }).

import { stegaClean } from 'next-sanity';
import { fetchContent } from '@/utils/cms/fetchContent';
import { fetchSeoSettings } from '@/utils/cms/fetchSeoSettings';

export async function buildPageMetadata({ slug, query, params }) {
	const [pageData, site] = await Promise.all([
		fetchContent(query, params),
		fetchSeoSettings(),
	]);

	// No Sanity yet, or seoSettings not created in the Studio yet.
	if (!site) return {};

	// stegaClean: in draft mode fetchContent returns stega-encoded strings,
	// which must never end up in <title> or meta tags.
	const seo = stegaClean(pageData?.seo ?? pageData?.page?.seo);

	return {
		title: seo?.title ?? site.defaultTitle,
		description: seo?.description ?? site.defaultDescription,
		keywords: seo?.keywords ?? site.keywords,
		alternates: {
			canonical: slug,
		},
		robots: {
			index: seo?.noIndex ? false : true,
			follow: true,
		},
		openGraph: {
			title: seo?.title ?? site.defaultTitle,
			description: seo?.description ?? site.defaultDescription,
			images: [
				{
					url: seo?.ogImage ?? site.ogImage,
					width: 1200,
					height: 630,
				},
			],
		},
	};
}
