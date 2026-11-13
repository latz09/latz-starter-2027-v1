// proxy.js (Next 16's name for middleware.js)
// Adds X-Robots-Tag: noindex where search engines should never look.
// Pages also carry their own robots meta / sitemap exclusions; this header is
// the layer that also covers non-HTML files like /cms-guide.html.

import { NextResponse } from 'next/server';

// Paths that are never indexed, on any host. Keep in sync with
// NOINDEX_PATHS in next-sitemap.config.js.
const NOINDEX_PREFIXES = ['/latz-studio', '/design', '/cms-guide', '/api'];

const isPreviewHost = (host) =>
	host.endsWith('.latzwebdesign.com') || host.endsWith('.vercel.app');

export function proxy(request) {
	const host = request.headers.get('host') || '';
	const { pathname } = request.nextUrl;
	const response = NextResponse.next();

	const noindexPath = NOINDEX_PREFIXES.some(
		(prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`) || pathname.startsWith(`${prefix}.`),
	);

	// Preview/staging hosts are noindexed entirely; real client domains stay
	// indexable apart from the paths above.
	if (noindexPath || isPreviewHost(host)) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	return response;
}

export const config = {
	// Skip Next's own build assets and image optimizer.
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
