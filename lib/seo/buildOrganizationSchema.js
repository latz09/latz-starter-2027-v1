// lib/seo/buildOrganizationSchema.js
// Builds JSON-LD from live seoSettings data.
// One function handles all schema types — no per-client files.



export function buildOrganizationSchema(seo) {
	if (!seo) return null

	return {
		'@context': 'https://schema.org',
		'@type': seo.schemaType ?? 'LocalBusiness',
		name: seo.siteName,
		url: seo.siteUrl,
		logo: seo.ogImage,
		description: seo.defaultDescription,
		telephone: seo.phone,
		email: seo.email,
		...(seo.address && {
			address: {
				'@type': 'PostalAddress',
				streetAddress: seo.address.street,
				addressLocality: seo.address.city,
				addressRegion: seo.address.state,
				postalCode: seo.address.zip,
				addressCountry: 'US',
			},
		}),
		...(seo.serviceAreas?.length && {
			areaServed: seo.serviceAreas.map((area) => ({
				'@type': 'AdministrativeArea',
				name: area,
			})),
		}),
		...(seo.priceRange && { priceRange: seo.priceRange }),
		contactPoint: {
			'@type': 'ContactPoint',
			telephone: seo.phone,
			contactType: 'customer service',
			email: seo.email,
			areaServed: 'US',
		},
	}
}