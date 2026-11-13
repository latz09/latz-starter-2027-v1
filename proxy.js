import { NextResponse } from 'next/server';

export function proxy(request) {
	const host = request.headers.get('host') || '';
	const response = NextResponse.next();

	// noindex any preview/staging host — real client domains stay indexable
	if (host.endsWith('.latzwebdesign.com') || host.endsWith('.vercel.app')) {
		response.headers.set('X-Robots-Tag', 'noindex, nofollow');
	}

	return response;
}

export const config = {
	matcher: '/:path*',
};