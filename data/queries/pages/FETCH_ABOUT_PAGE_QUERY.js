export const FETCH_ABOUT_PAGE_QUERY = `*[_type == "aboutPage"    && _id == "aboutPage"][0]{
  title,
  seo{
    title,
    description,
    keywords,
    "ogImage": ogImage.asset->url,
    noIndex,
  }
}`