// schemaTypes/contactPage.js
// Stub — title + SEO only. Generator Phase 1 replaces this with the real
// section fields once the overview doc, wireframe, and Figma screenshots
// are in.

import { seoField } from './partials/seoField'

export default {
  name: 'contactPage',
  type: 'document',
  title: 'Contact Page',
  groups: [{ name: 'seo', title: '🔍 SEO' }],
  fields: [
    {
      name: 'title',
      type: 'string',
      title: 'Title',
      initialValue: 'Contact',
    },
    ...seoField.map((f) => ({ ...f, group: 'seo' })),
  ],
  preview: {
    select: { title: 'title' },
  },
}
