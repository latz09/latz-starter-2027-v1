// schemaTypes/partials/seoField.js
// Reusable SEO field — spread into any page schema with ...seoField
//
// Usage:
// import { seoField } from './partials/seoField'
// export default {
//   name: 'homePage',
//   type: 'document',
//   fields: [
//     ...,
//     ...seoField.map((f) => ({ ...f, group: 'seo' })), // assign to the SEO group
//   ],
// }

export const seoField = [
  {
    name: 'seo',
    type: 'object',
    title: 'SEO',
    description: 'Leave blank to use site defaults from SEO Settings.',
    options: { collapsible: true, collapsed: true },
    fields: [
      {
        name: 'title',
        type: 'string',
        title: 'Page Title',
        description: '50-60 characters. Leave blank to use site default.',
      },
      {
        name: 'description',
        type: 'text',
        title: 'Meta Description',
        rows: 3,
        description: '150-160 characters. Leave blank to use site default.',
      },
      {
        name: 'keywords',
        type: 'array',
        title: 'Keywords',
        description: 'Page-specific keywords. Leave blank to use site defaults.',
        of: [{ type: 'string' }],
        options: { layout: 'tags' },
      },
      {
        name: 'ogImage',
        type: 'image',
        title: 'Social Share Image',
        description: '1200x630px. Leave blank to use the default OG image.',
        options: { hotspot: true },
      },
      {
        name: 'noIndex',
        type: 'boolean',
        title: 'Hide from search engines',
        description: 'Sets noindex. Use for thank-you pages, redirects, etc.',
        initialValue: false,
      },
    ],
  },
]
