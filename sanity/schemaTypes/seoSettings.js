// schemaTypes/seoSettings.js

export default {
  name: 'seoSettings',
  type: 'document',
  title: 'SEO Settings',
  fields: [
    // ── Site Identity ──────────────────────────────────────────────────────
    {
      name: 'siteName',
      type: 'string',
      title: 'Site Name',
      description: 'Business name as it appears in the title tag. e.g. "Acme Cleaning Co."',
    },
    {
      name: 'siteUrl',
      type: 'url',
      title: 'Site URL',
      description: 'Production URL with https. e.g. "https://www.acmecleaning.com"',
    },
    {
      name: 'titleTemplate',
      type: 'string',
      title: 'Title Template',
      description: 'Use %s as the page title placeholder. e.g. "%s | Acme Cleaning Co."',
      initialValue: '%s | Site Name',
    },

    // ── Default Meta ───────────────────────────────────────────────────────
    {
      name: 'defaultTitle',
      type: 'string',
      title: 'Default Title',
      description: 'Homepage title and fallback for pages with no custom title. 50-60 chars.',
    },
    {
      name: 'defaultDescription',
      type: 'text',
      title: 'Default Description',
      rows: 3,
      description: 'Fallback meta description site-wide. 150-160 chars.',
    },
    {
      name: 'keywords',
      type: 'array',
      title: 'Keywords',
      description: 'Primary site keywords. 5-10 is plenty.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
    {
      name: 'ogImage',
      type: 'image',
      title: 'Default OG Image',
      description: 'Social share image. 1200x630px. Used on all pages unless overridden.',
      options: { hotspot: true },
    },

    // ── Social ────────────────────────────────────────────────────────────
    {
      name: 'twitterHandle',
      type: 'string',
      title: 'Twitter / X Handle',
      description: 'Include the @. Leave blank if client has no presence.',
    },

    // ── Schema.org ────────────────────────────────────────────────────────
    {
      name: 'schemaType',
      type: 'string',
      title: 'Schema Type',
      description: 'Organization for non-physical businesses. LocalBusiness for everyone else.',
      options: {
        list: [
          { title: 'Organization', value: 'Organization' },
          { title: 'LocalBusiness', value: 'LocalBusiness' },
          { title: 'Restaurant', value: 'Restaurant' },
          { title: 'HomeAndConstructionBusiness', value: 'HomeAndConstructionBusiness' },
          { title: 'CleaningService', value: 'CleaningService' },
          { title: 'Photographer', value: 'Photographer' },
          { title: 'InsuranceAgency', value: 'InsuranceAgency' },
        ],
        layout: 'radio',
      },
      initialValue: 'LocalBusiness',
    },
    {
      name: 'phone',
      type: 'string',
      title: 'Phone Number',
      description: 'e.g. 715-000-0000',
    },
    {
      name: 'email',
      type: 'string',
      title: 'Email Address',
    },
    {
      name: 'address',
      type: 'object',
      title: 'Address',
      fields: [
        { name: 'street', type: 'string', title: 'Street Address' },
        { name: 'city',   type: 'string', title: 'City' },
        { name: 'state',  type: 'string', title: 'State', initialValue: 'WI' },
        { name: 'zip',    type: 'string', title: 'ZIP Code' },
      ],
    },
    {
      name: 'serviceAreas',
      type: 'array',
      title: 'Service Areas',
      description: 'Cities or counties served. Used in schema areaServed.',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    },
    {
      name: 'priceRange',
      type: 'string',
      title: 'Price Range',
      description: 'For LocalBusiness schema. $, $$, $$$, or $$$$',
      options: { list: ['$', '$$', '$$$', '$$$$'], layout: 'radio' },
    },
  ],
  preview: {
    select: { title: 'siteName', subtitle: 'siteUrl' },
  },
}
