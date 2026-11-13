// data/queries/FETCH_SEO_SETTINGS_QUERY.js

export const FETCH_SEO_SETTINGS_QUERY = `*[_type == "seoSettings"  && _id == "seoSettings"][0]{
  siteName,
  siteUrl,
  titleTemplate,
  defaultTitle,
  defaultDescription,
  keywords,
  "ogImage": ogImage.asset->url,
  twitterHandle,
  schemaType,
  phone,
  email,
  address,
  serviceAreas,
  priceRange,
}`




// Add this seo{} block to the bottom of every page query.
// The rest of the query stays exactly the same.

// Example: data/queries/pages/FETCH_ABOUT_QUERY.js
// export const FETCH_ABOUT_QUERY = `*[_type == "aboutPage"][0]{
//   hero,
//   content,
//   // ... all your other page fields ...

//   seo{
//     title,
//     description,
//     keywords,
//     "ogImage": ogImage.asset->url,
//     noIndex,
//   }
// }`