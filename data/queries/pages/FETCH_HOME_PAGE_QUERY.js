export const FETCH_HOME_PAGE_QUERY = `*[_type == "homePage"][0]{
  title,
  seo{
    title,
    description,
    keywords,
    "ogImage": ogImage.asset->url,
    noIndex,
  }
}`