// components/ui/VisualEditingClient.js
// Click-to-edit overlays + live refresh inside the Presentation tool.
// Rendered by SiteShell only when draft mode is on, so it costs nothing for
// normal visitors.

import { VisualEditing } from 'next-sanity/visual-editing';

export default function VisualEditingClient() {
	return <VisualEditing />;
}
