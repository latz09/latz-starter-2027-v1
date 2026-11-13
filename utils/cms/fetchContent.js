// utils/cms/fetchContent.js
// The `fc` helper every page file calls: fc(Q) or fc(Q, { slug }).
//
// Draft mode (turned on by the Presentation tool via /api/draft-mode/enable)
// switches to the drafts perspective, the viewer token, no caching, and stega
// encoding so the Studio can draw click-to-edit overlays.
//
// Never call this from generateStaticParams: draftMode() throws outside a
// request scope. Use sanityClient.fetch() directly there.

import { draftMode } from 'next/headers';
import { sanityClient } from './sanityConnection';

export async function fetchContent(query, params = {}) {
	// No Sanity project yet: pages render their placeholder content.
	if (!sanityClient) return null;

	const { isEnabled: isDraftMode } = await draftMode();

	try {
		const client = isDraftMode
			? sanityClient.withConfig({ token: process.env.SANITY_VIEWER_TOKEN })
			: sanityClient;

		return await client.fetch(query, params, {
			perspective: isDraftMode ? 'drafts' : 'published',
			stega: isDraftMode,
			next: { revalidate: isDraftMode ? 0 : 10 },
		});
	} catch (error) {
		console.error('Error fetching data:', error);
		throw new Error('Failed to fetch data');
	}
}
