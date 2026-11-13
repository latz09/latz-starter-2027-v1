// next.config.mjs

import { redirects } from './data/config/redirects.js';

// SVG handling (Turbopack, the Next 16 default bundler):
//   import Icon from './icon.svg'       → React component (SVGR)
//   import iconUrl from './icon.svg?url' → static asset, use iconUrl.src
// The ?url form is for <img src>, CSS backgrounds, or next/image.
const svgrLoader = {
	loader: '@svgr/webpack',
	options: {
		svgoConfig: {
			plugins: [
				{
					name: 'preset-default',
					params: { overrides: { removeViewBox: false } },
				},
				'removeDimensions',
			],
		},
	},
};

/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'cdn.sanity.io',
				pathname: '/**',
			},
		],
	},
	async redirects() {
		return redirects;
	},
	turbopack: {
		rules: {
			'*.svg': {
				condition: { not: { query: /[?&]url(?=&|$)/ } },
				loaders: [svgrLoader],
				as: '*.js',
			},
		},
	},
};

export default nextConfig;
