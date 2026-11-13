// sanity/env.js
// Single source for the Sanity connection settings. Read by both the
// embedded Studio (sanity.config.js) and the site (utils/cms/*), so the two
// can never point at different projects.
//
// NEXT_PUBLIC_ because the Studio runs in the browser and needs them too.
// Neither value is a secret: the project ID and dataset name are visible in
// every image URL the site serves.

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

// Pin the API version to a date. Bump on purpose, never to "today".
export const apiVersion = '2026-11-01';

// The embedded Studio route. Must match basePath in sanity.config.js and the
// folder name under app/. Change all three together, or not at all.
export const studioPath = '/latz-studio';

// False until new-client.mjs (or you) writes a project ID into .env.local.
// Everything that talks to Sanity checks this first, so a fresh copy of the
// starter boots and builds with placeholder content instead of erroring.
export const isSanityConfigured = Boolean(projectId);
