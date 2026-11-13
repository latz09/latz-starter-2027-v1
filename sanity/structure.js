// structure.js
// Stub — generator Phase 1 replaces this entirely once real schemas exist,
// with icons matched to the client's actual pages/collections. This just
// needs to keep `npm run dev` from crashing before that happens.
//
// Reminder for whoever's editing this by hand: @sanity/icons v5+ dropped
// named exports from the package root. Import each icon from its own
// subpath — `import { HomeIcon } from '@sanity/icons/Home'` — never a
// combined `import { HomeIcon, CogIcon } from '@sanity/icons'` block.

import { CogIcon } from '@sanity/icons/Cog'
import { HomeIcon } from '@sanity/icons/Home'
import { InfoOutlineIcon } from '@sanity/icons/InfoOutline'
import { BulbOutlineIcon } from '@sanity/icons/BulbOutline'
import { EnvelopeIcon } from '@sanity/icons/Envelope'
import { MenuIcon } from '@sanity/icons/Menu'
import { CommentIcon } from '@sanity/icons/Comment'
import { UsersIcon } from '@sanity/icons/Users'

const singletonTypes = new Set([
  'navigation',
  'homePage',
  'aboutPage',
  'servicesPage',
  'contactPage',
  'seoSettings',
])

export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Navigation')
        .icon(MenuIcon)
        .child(S.document().schemaType('navigation').documentId('navigation')),
      S.listItem()
        .title('Home Page')
        .icon(HomeIcon)
        .child(S.document().schemaType('homePage').documentId('homePage')),
      S.listItem()
        .title('About Page')
        .icon(InfoOutlineIcon)
        .child(S.document().schemaType('aboutPage').documentId('aboutPage')),
      S.listItem()
        .title('Services Page')
        .icon(BulbOutlineIcon)
        .child(S.document().schemaType('servicesPage').documentId('servicesPage')),
      S.listItem()
        .title('Contact Page')
        .icon(EnvelopeIcon)
        .child(S.document().schemaType('contactPage').documentId('contactPage')),
      S.divider(),
      S.documentTypeListItem('testimonial')
        .title('Testimonials')
        .icon(CommentIcon)
        .child(
          S.documentTypeList('testimonial')
            .title('Testimonials')
            .defaultOrdering([{ field: 'order', direction: 'asc' }])
        ),
      S.divider(),
      S.documentTypeListItem('contactForm')
        .title('Form Submissions')
        .icon(UsersIcon)
        .child(
          S.documentTypeList('contactForm')
            .title('Form Submissions')
            .defaultOrdering([{ field: 'submittedAt', direction: 'desc' }])
        ),
      S.divider(),
      S.listItem()
        .title('SEO Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('seoSettings').documentId('seoSettings')),
    ])

const allowedSingletonActions = new Set(['publish', 'discardChanges', 'restore'])

export const singletonActions = (prev, { schemaType }) =>
  singletonTypes.has(schemaType)
    ? prev.filter((action) => allowedSingletonActions.has(action.action || action))
    : prev

export const singletonNewDocument = (prev, { creationContext }) =>
  creationContext?.type === 'global'
    ? prev.filter((templateItem) => !singletonTypes.has(templateItem.templateId))
    : prev
