// schemaTypes/navigation.js
// Basic nav — generator updates initialValue to match the client's actual
// site structure once schemas are generated. Every navLink keeps label,
// url, and isButton (last link is typically the CTA button).

export default {
  name: 'navigation',
  type: 'document',
  title: 'Navigation',
  fields: [
    {
      name: 'navLinks',
      type: 'array',
      title: 'Nav Links',
      of: [
        {
          type: 'object',
          name: 'navLink',
          fields: [
            { name: 'label', type: 'string', title: 'Label' },
            { name: 'url', type: 'string', title: 'URL' },
            {
              name: 'isButton',
              type: 'boolean',
              title: 'Show as CTA Button',
              initialValue: false,
            },
          ],
          preview: {
            select: { title: 'label', subtitle: 'url', isButton: 'isButton' },
            prepare({ title, subtitle, isButton }) {
              return {
                title: isButton ? `${title} [CTA]` : title,
                subtitle,
              }
            },
          },
        },
      ],
      initialValue: [
        { label: 'Home', url: '/', isButton: false },
        { label: 'About', url: '/about', isButton: false },
        { label: 'Services', url: '/services', isButton: false },
        { label: 'Contact', url: '/contact', isButton: true },
      ],
    },
  ],
  preview: {
    select: {},
    prepare() {
      return { title: 'Navigation' }
    },
  },
}
