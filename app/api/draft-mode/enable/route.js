// app/api/draft-mode/enable/route.js
// Called by the Presentation tool to turn on draft mode. defineEnableDraftMode
// validates a short-lived secret the Studio creates, so random visitors can't
// switch draft mode on.

import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { sanityClient } from '@/utils/cms/sanityConnection';

const notConfigured = () =>
	new Response('Sanity is not connected yet (no NEXT_PUBLIC_SANITY_PROJECT_ID).', {
		status: 503,
	});

export const { GET } = sanityClient
	? defineEnableDraftMode({
			client: sanityClient.withConfig({ token: process.env.SANITY_VIEWER_TOKEN }),
		})
	: { GET: notConfigured };
