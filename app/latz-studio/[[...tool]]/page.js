// app/latz-studio/[[...tool]]/page.js
// The embedded Sanity Studio. Every /latz-studio/* URL lands here and the
// Studio's own router takes over in the browser.
//
// Lives outside app/(site)/, so the site's nav, footer, globals.css and
// Tailwind preflight never touch the Studio.

import { NextStudio, metadata as studioMetadata, viewport } from 'next-sanity/studio';
import config from '@/sanity.config';
import { isSanityConfigured } from '@/sanity/env';
import StudioNotConnected from '@/sanity/components/StudioNotConnected';

export const dynamic = 'force-static';

// next-sanity's defaults already set robots: noindex. proxy.js also sends an
// X-Robots-Tag header for this route as a second layer.
export const metadata = {
	...studioMetadata,
	title: 'Content Studio',
};

export { viewport };

export default function StudioPage() {
	if (!isSanityConfigured) return <StudioNotConnected />;
	return <NextStudio config={config} />;
}
