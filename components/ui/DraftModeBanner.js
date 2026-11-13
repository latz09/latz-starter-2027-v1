// components/ui/DraftModeBanner.js
// Shown when draft mode is on but the page is NOT inside the Presentation
// tool's iframe (e.g. someone opened a shared preview link), so they know
// they're seeing unpublished content and can get out of it.

'use client';

import { useIsPresentationTool } from 'next-sanity/hooks';

export default function DraftModeBanner() {
	const isPresentationTool = useIsPresentationTool();
	if (isPresentationTool !== false) return null;

	return (
		<a
			href='/api/draft-mode/disable'
			className='fixed bottom-1 left-1 z-modal rounded bg-dark px-1 py-0.5 text-caption text-light'
		>
			Previewing drafts. Exit preview
		</a>
	);
}
