import { readFile } from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET() {
	if (process.env.NODE_ENV === 'production') {
		return new Response('Not found', { status: 404 });
	}

	try {
		const html = await readFile(
			path.join(process.cwd(), 'START-HERE.html'),
			'utf8'
		);
		return new Response(html, {
			headers: {
				'Content-Type': 'text/html; charset=utf-8',
				'X-Robots-Tag': 'noindex',
			},
		});
	} catch {
		return new Response('START-HERE.html not found', { status: 404 });
	}
}