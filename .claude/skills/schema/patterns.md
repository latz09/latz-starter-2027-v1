# Schema patterns

Read when /schema needs one. Match the real files in the project first; these are shapes, not copy-paste if the project differs.

## CTA objects

```js
// Flexible destination
{ name: 'cta', type: 'object', title: 'CTA', fields: [
  { name: 'label', type: 'string', title: 'Label' },
  { name: 'url', type: 'string', title: 'URL', description: 'e.g. /about or https://...' },
] }

// Fixed destination (URL hardcoded in the component, only the text is editable)
{ name: 'cta', type: 'object', title: 'Link to About Page', fields: [
  { name: 'label', type: 'string', title: 'Link Text', description: 'Links to the About page', initialValue: 'Learn more about us' },
] }

// Destination is a CMS document (whichever case study this points to)
{ name: 'cta', type: 'object', title: 'CTA', fields: [
  { name: 'label', type: 'string', title: 'Label' },
  { name: 'caseStudy', type: 'reference', title: 'Linked Case Study', to: [{ type: 'caseStudy' }] },
] }
```

Fixed link groups use named string fields (`agendasLabel`, `contactLabel`), never an array.

## Navigation extras (only if the design needs them)

```js
// on navLink: dropdown
{ name: 'children', type: 'array', title: 'Dropdown Links', of: [{ type: 'object', fields: [
  { name: 'label', type: 'string' }, { name: 'url', type: 'string' } ] }] }

// on navLink: more than one button treatment, or an external system
{ name: 'buttonStyle', type: 'string', title: 'Button Style',
  options: { list: [{ title: 'Primary (filled)', value: 'primary' }, { title: 'Secondary (outline)', value: 'secondary' }], layout: 'radio' },
  hidden: ({ parent }) => !parent?.isButton },
{ name: 'isExternal', type: 'boolean', title: 'External Link', description: 'Opens in a new tab.', initialValue: false },
```

## Collections

```js
export default {
  name: 'serviceOffering', type: 'document', title: 'Service',
  orderings: [{ title: 'Order', name: 'order', by: [{ field: 'order', direction: 'asc' }] }],
  fields: [
    { name: 'title', type: 'string', title: 'Title' },
    { name: 'order', type: 'number', title: 'Display Order' },
    // ...
  ],
  preview: { select: { title: 'title', subtitle: 'order' } },
}
```

A page that previews content owned by a page not being built yet (Home previews Services): create the collection now, query it from Home as a compound query, reuse it later. Do not duplicate the content as inline fields.

**Testimonials.** The starter already has `testimonials.js` (type `testimonial`: `name`, `roleOrCompany`, `quote`, `photo`, `order`). Extend that file, keep its field names, and add `featured` (boolean, default false) when the design shows only some quotes. Query featured ones as `*[_type == "testimonial" && featured == true] | order(order asc){ _id, quote, name, roleOrCompany }`. Matched-or-fallback (`seriesTag` + `isDefault`) only when the project has a product or series concept for testimonials to match against. Drop the file entirely if the design has no testimonials.

**Shared icon or badge collection.** When small graphics are reused across schemas (service icons, badges, partner logos), one document type named `icon` with `name`, optional `category` (radio list), and `image`. Reference it with `{ type: 'reference', to: [{ type: 'icon' }] }` and project `"iconUrl": icon->image.asset->url`. Keep the type name `icon` even when it holds badges.

## siteSettings (footer extras `seoSettings` lacks)

Read the real `seoSettings.js` first and do not duplicate what it has (`siteName`, `phone`, `email`, address). Singleton with only the gaps: `fax`, `socialLinks[{platform, url}]`, `footerColumnHeadings`, fixed-destination link labels, `copyrightName`, `legalLinks[{label, url}]`. Add it to `singletonTypes`, the sidebar (settings section), `index.js`, `GLOBAL_TYPES` in `sanity/presentation.js`, and give it `FETCH_SITE_SETTINGS_QUERY.js`.

## Contact page

Groups: Hero (`headline`, `subheadline` text rows 2), Office, Testimonials, SEO.

`office` is three named object fields, not an array, because the set is always these three:
`address { value (text, rows 2), icon (reference to icon) }`, `phone { value, icon }`, `email { value, icon }`, plus a `heading`. Query icons as `"iconUrl": icon->image.asset->url`. Labels ("Address", "Phone") are hardcoded in the component.

`testimonialSection { sectionLabel, heading }` mirrors Home's. The quotes come from the `testimonial` collection (`featured == true`), so the page query is compound: `{ "page": ..., "testimonials": *[_type == "testimonial" && featured == true] | order(order asc){...} }`.

Form fields are configured in `data/config/contact.js`, not in the page schema. If the design's fields differ from name, email, phone, message, change `contactConfig.formFields` and `sanity/schemaTypes/contactForm.js` together.

## Dynamic route (`app/(site)/<parent>/[slug]/page.js`)

```js
import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { sanityClient } from '@/utils/cms/sanityConnection';
import { FETCH_CASE_STUDY_QUERY as Q } from '@/data/queries/caseStudy/FETCH_CASE_STUDY_QUERY';
import { FETCH_CASE_STUDY_SLUGS_QUERY as SLUGS_Q } from '@/data/queries/caseStudy/FETCH_CASE_STUDY_SLUGS_QUERY';
import PageContainer from '@/components/animations/PageContainer';
import Section from '@/components/layout/Section';

export async function generateStaticParams() {
	// Build time, no request scope: never fc() here (draftMode() throws).
	// sanityClient is null with no Sanity project, so fall back to no params.
	const items = (await sanityClient?.fetch(SLUGS_Q)) || [];
	return items.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }) {
	const { slug } = await params;
	return BPM({ slug: `/our-projects/${slug}`, query: Q, params: { slug } });
}

const CaseStudy = async ({ params }) => {
	const { slug } = await params;
	const data = await fc(Q, { slug });
	return (
		<PageContainer>
			<Section className='h-[80vh] grid place-items-center'>
				<h1>{data?.title}</h1>
			</Section>
		</PageContainer>
	);
};

export default CaseStudy;
export const revalidate = 10;
```

Detail query: `*[_type == "caseStudy" && slug.current == $slug][0]{ ... }`. Slugs query: `*[_type == "caseStudy" && defined(slug.current)]{ "slug": slug.current }`. Presentation: add `{ route: '/our-projects/:slug', filter: '_type == "caseStudy" && slug.current == $slug' }` to `mainDocuments`. If the empty-params case breaks the build (Next requires at least one param for some output modes), tell Jordan rather than inventing a placeholder slug.
