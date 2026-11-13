export const FETCH_NAVIGATION_QUERY = `*[_type == "navigation" && _id == "navigation"][0]{
  logo{
    asset->{url}
  },
  navLinks[]{
    label,
    url,
    isButton
  }
}`;