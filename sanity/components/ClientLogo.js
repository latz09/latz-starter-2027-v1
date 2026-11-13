// sanity/components/ClientLogo.js
// Studio navbar icon. The image path is set in sanity/branding.js.

import { branding } from '../branding';

const ClientLogo = () => (
	// eslint-disable-next-line @next/next/no-img-element
	<img
		src={branding.logoUrl}
		alt={branding.studioTitle}
		style={{ width: '25px', height: '25px', objectFit: 'contain' }}
	/>
);

export default ClientLogo;
