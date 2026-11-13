'use client';

// sanity.config.js
// Embedded Studio config, served by app/latz-studio/[[...tool]]/page.js.
// Per-client values live in sanity/branding.js and .env.local, not here.

import { buildLegacyTheme, defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { presentationTool } from 'sanity/presentation';
import { visionTool } from '@sanity/vision';

import { apiVersion, dataset, projectId, studioPath } from './sanity/env';
import { branding } from './sanity/branding';
import { schemaTypes } from './sanity/schemaTypes';
import {
	structure,
	singletonActions,
	singletonNewDocument,
} from './sanity/structure';
import { locations, mainDocuments } from './sanity/presentation';
import CustomLayout from './sanity/components/CustomLayout';
import ClientLogo from './sanity/components/ClientLogo';

const { colors } = branding;

const theme = buildLegacyTheme({
	'--black': colors.dark,
	'--white': colors.light,
	'--gray': colors.gray,
	'--gray-base': colors.gray,
	'--component-bg': colors.light,
	'--component-text-color': colors.dark,
	'--brand-primary': colors.primary,
	'--default-button-color': colors.gray,
	'--default-button-primary-color': colors.primary,
	'--default-button-success-color': colors.positive,
	'--default-button-warning-color': colors.caution,
	'--default-button-danger-color': colors.critical,
	'--state-info-color': colors.primary,
	'--state-success-color': colors.positive,
	'--state-warning-color': colors.caution,
	'--state-danger-color': colors.critical,
	'--main-navigation-color': colors.dark,
	'--main-navigation-color--inverted': colors.light,
	'--focus-color': colors.primary,
});

export default defineConfig({
	name: 'default',
	title: branding.studioTitle,
	subtitle: branding.studioSubtitle,
	icon: ClientLogo,

	basePath: studioPath,
	projectId,
	dataset,

	theme,
	releases: { enabled: false },

	plugins: [
		structureTool({ title: 'Edit Content', structure }),
		// Live preview with click-to-edit. Same origin as the site, so no
		// preview URL to configure: it loads this site's own pages in draft mode.
		presentationTool({
			title: 'Live Preview',
			previewUrl: {
				previewMode: { enable: '/api/draft-mode/enable' },
			},
			resolve: { mainDocuments, locations },
		}),
		// GROQ playground for you, hidden from clients on the live site.
		...(process.env.NODE_ENV === 'development'
			? [visionTool({ defaultApiVersion: apiVersion })]
			: []),
	],

	schema: { types: schemaTypes },

	document: {
		actions: singletonActions,
		newDocumentOptions: singletonNewDocument,
	},

	studio: {
		components: {
			layout: CustomLayout,
		},
	},
});
