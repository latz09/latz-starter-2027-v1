// schemaTypes/index.js
// Barrel export — logical order: navigation, pages (site order),
// collection types, seoSettings, contactForm.

import navigation from './navigation'
import homePage from './homePage'
import aboutPage from './aboutPage'
import servicesPage from './servicesPage'
import contactPage from './contactPage'
import testimonials from './testimonials'
import seoSettings from './seoSettings'
import contactForm from './contactForm'

export const schemaTypes = [
  navigation,
  homePage,
  aboutPage,
  servicesPage,
  contactPage,
  testimonials,
  seoSettings,
  contactForm,
]
