// schemaTypes/testimonials.js
// Generic collection type. Fine to drop entirely for a given client
// project (per generator conventions) if the design doesn't use it.

export default {
  name: 'testimonial',
  type: 'document',
  title: 'Testimonial',
  fields: [
    { name: 'name', type: 'string', title: 'Name' },
    { name: 'roleOrCompany', type: 'string', title: 'Role / Company' },
    { name: 'quote', type: 'text', title: 'Quote', rows: 4 },
    {
      name: 'photo',
      type: 'image',
      title: 'Photo',
      options: { hotspot: true },
    },
    {
      name: 'order',
      type: 'number',
      title: 'Display Order',
    },
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: { title: 'name', subtitle: 'roleOrCompany', media: 'photo' },
  },
}
