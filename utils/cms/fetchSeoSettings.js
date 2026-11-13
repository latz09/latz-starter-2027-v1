// utils/cms/fetchSeoSettings.js
// The seoSettings singleton: site-wide metadata, JSON-LD, footer contact info.
// Always the published version with stega off, since it feeds <head> tags
// and emails, where invisible stega characters would end up in real output.

import { sanityClient } from '@/utils/cms/sanityConnection';
import { FETCH_SEO_SETTINGS_QUERY } from '@/data/queries/seo/FETCH_SEO_SETTINGS_QUERY';

export async function fetchSeoSettings() {
	if (!sanityClient) return null;

	return sanityClient.fetch(
		FETCH_SEO_SETTINGS_QUERY,
		{},
		{
			stega: false,
			// 10s while building. Raise to 3600 at launch: SEO settings rarely change.
			next: { revalidate: 10 },
		},
	);
}
