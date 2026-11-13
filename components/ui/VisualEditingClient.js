'use client';

// components/ui/VisualEditingClient.js
// Click-to-edit overlays + live refresh inside the Presentation tool.
// Rendered by SiteShell only when draft mode is on, so it costs nothing for
// normal visitors.
//
// next-sanity 13's <VisualEditing /> ignores draft edits ("mutation" events)
// unless you pass a refresh handler, so this one re-renders the page on every
// edit. Debounced: typing a sentence triggers one refresh shortly after you
// pause, not one per keystroke (each refresh re-runs the page's queries).

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { VisualEditing } from 'next-sanity/visual-editing';

const DEBOUNCE_MS = 400;

export default function VisualEditingClient() {
	const router = useRouter();
	const timer = useRef(null);
	const pending = useRef([]);

	const refresh = useCallback(
		(payload) => {
			if (payload.source !== 'manual' && payload.source !== 'mutation') return false;

			return new Promise((resolve) => {
				pending.current.push(resolve);
				clearTimeout(timer.current);
				timer.current = setTimeout(() => {
					router.refresh();
					const resolvers = pending.current;
					pending.current = [];
					resolvers.forEach((done) => done());
				}, payload.source === 'manual' ? 0 : DEBOUNCE_MS);
			});
		},
		[router],
	);

	return <VisualEditing refresh={refresh} />;
}
