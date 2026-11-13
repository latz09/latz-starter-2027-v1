// schemaTypes/aboutPage.js
// Stub — title + SEO only. Generator Phase 1 replaces this with the real
// section fields once the overview doc, wireframe, and Figma screenshots
// are in.

import { seoField } from './partials/seoField'

export default {
  name: 'aboutPage',
  type: 'document',
  title: 'About Page',
  groups: [{ name: 'seo', title: '🔍 SEO' }],
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      initialValue: 'About',
    },
    ...seoField.map((f) => ({ ...f, group: 'seo' })),
  ],
  preview: {
    select: { title: 'title' },
  },
}
