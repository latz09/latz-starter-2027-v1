// data/queries/seo/FETCH_SEO_SETTINGS_QUERY.js
// The seoSettings singleton. Never regenerated per client.
//
// Every page query ends with the same seo{} block:
//   seo{
//     title,
//     description,
//     keywords,
//     "ogImage": ogImage.asset->url,
//     noIndex
//   }

export const FETCH_SEO_SETTINGS_QUERY = `*[_type == "seoSettings" && _id == "seoSettings"][0]{
  siteName,
  siteUrl,
  titleTemplate,
  defaultTitle,
  defaultDescription,
  keywords,
  "ogImage": ogImage.asset->url,
  "emailLogoUrl": emailLogo.asset->url,
  twitterHandle,
  schemaType,
  phone,
  email,
  address,
  serviceAreas,
  priceRange
}`;
