export const FETCH_CONTACT_PAGE_QUERY = `*[_type == "contactPage"  && _id == "contactPage"][0]{
  title,
  seo{
    title,
    description,
    keywords,
    "ogImage": ogImage.asset->url,
    noIndex,
  }
}`