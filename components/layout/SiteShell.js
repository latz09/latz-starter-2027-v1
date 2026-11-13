// components/layout/SiteShell.js
// Everything that wraps a site page: JSON-LD, nav, <main>, footer, analytics,
// the design-system badge, and visual editing in draft mode.
//
// Used by app/(site)/layout.js AND app/not-found.js. The root 404 sits
// outside the (site) route group, so without this it would render with no
// nav or footer.

import { draftMode } from 'next/headers';
import { Analytics } from '@vercel/analytics/next';
import NavigationContainer from '@/components/layout/navigation/NavigationContainer';
import Footer from '@/components/layout/footer/Footer';
import JsonLd from '@/components/seo/JsonLd';
import DesignSystemBadge from '@/components/design/DesignSystemBadge';
import VisualEditingClient from '@/components/ui/VisualEditingClient';
import DraftModeBanner from '@/components/ui/DraftModeBanner';
import { fetchSeoSettings } from '@/utils/cms/fetchSeoSettings';
import { buildOrganizationSchema } from '@/lib/seo/buildOrganizationSchema';

const SiteShell = async ({ children }) => {
	const seo = await fetchSeoSettings(); // cached, same call as generateMetadata
	const schema = buildOrganizationSchema(seo);
	const { isEnabled: isDraftMode } = await draftMode();

	return (
		<>
			{schema && <JsonLd data={schema} />}
			<NavigationContainer />
			<main>{children}</main>
			<Footer businessName={seo?.siteName} />
			<Analytics />
			<DesignSystemBadge />
			{isDraftMode && (
				<>
					<VisualEditingClient />
					<DraftModeBanner />
				</>
			)}
		</>
	);
};

export default SiteShell;
