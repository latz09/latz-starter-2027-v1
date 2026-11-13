import { urlFor } from './sanityConnection';

// Generate optimized image URL from Sanity image object
export function getSanityImageUrl(image, options = {}) {
	if (!image?.asset || !urlFor(image)) return null;

	const {
		width = 1920,
		height = 1080,
		quality = 90,
		format = 'webp',
		fit = 'crop',
	} = options;

	return urlFor(image)
		.width(width)
		.height(height)
		.quality(quality)
		.format(format)
		.fit(fit)
		.url();
}

// Get CSS object-position from Sanity hotspot data
export function getHotspotStyles(image) {
	if (!image?.hotspot) {
		return { objectPosition: 'center center' };
	}

	const { x, y } = image.hotspot;
	return {
		objectPosition: `${x * 100}% ${y * 100}%`,
	};
}

// Get responsive image URLs for different breakpoints
export function getResponsiveImageUrls(image, breakpoints = {}) {
	if (!image?.asset) return {};

	const defaultBreakpoints = {
		mobile: { width: 640, height: 360 },
		tablet: { width: 1024, height: 576 },
		desktop: { width: 1920, height: 1080 },
		...breakpoints,
	};

	const urls = {};

	Object.entries(defaultBreakpoints).forEach(([key, { width, height }]) => {
		urls[key] = getSanityImageUrl(image, { width, height });
	});

	return urls;
}

// Common image size presets for your site
export const IMAGE_PRESETS = {
	hero: { width: 1920, height: 1080, quality: 90 },
	card: { width: 400, height: 300, quality: 85 },
	cardWide: { width: 600, height: 400, quality: 85 }, // 3:2 ratio
	thumbnail: { width: 200, height: 150, quality: 80 },
	gallery: { width: 800, height: 600, quality: 90 },
	fullWidth: { width: 1200, height: 800, quality: 90 },
	square: { width: 600, height: 600, quality: 85 }, // Profile pics, etc.
	portrait: { width: 600, height: 800, quality: 85 }, // 3:4 ratio
};
