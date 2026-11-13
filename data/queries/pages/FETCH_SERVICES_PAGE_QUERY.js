export const FETCH_SERVICES_PAGE_QUERY = `*[_type == "servicesPage" && _id == "servicesPage"][0]{
  title,
  seo{
    title,
    description,
    keywords,
    "ogImage": ogImage.asset->url,
    noIndex,
  }
}`