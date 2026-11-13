// utils/cms/sanityConnection.js
// The site's Sanity client. Server-side only in practice: the tokens below
// are not NEXT_PUBLIC_, so they're undefined if this ever reaches a browser.
//
// Three levels of access, each used in exactly one place:
//   sanityClient       no token, published content only (every normal page read)
//   draft reads        SANITY_VIEWER_TOKEN, added in fetchContent.js in draft mode
//   writes             SANITY_API_TOKEN (editor), added in pages/api/submitContactForm.js
//
// When no project ID is set (fresh copy of the starter), sanityClient is null
// and every helper in utils/cms returns null so pages render placeholders.

import { createClient } from 'next-sanity';
import { createImageUrlBuilder } from '@sanity/image-url';
import { apiVersion, dataset, projectId, isSanityConfigured, studioPath } from '@/sanity/env';

export const sanityClient = isSanityConfigured
	? createClient({
			projectId,
			dataset,
			apiVersion,
			useCdn: false,
			// Stega (click-to-edit overlays) is switched on per request in
			// fetchContent.js, only in draft mode. Off everywhere else.
			stega: { enabled: false, studioUrl: studioPath },
		})
	: null;

const builder = isSanityConfigured ? createImageUrlBuilder({ projectId, dataset }) : null;

export function urlFor(source) {
	return builder ? builder.image(source) : null;
}
