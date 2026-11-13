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

// Image size presets, one per fixed-frame image slot in THIS project,
// named for where it's used (hero, teamCard, galleryCarousel). Starts empty
// on purpose: add an entry when you build a section that needs one.
//   hero: { width: 1920, height: 1080, quality: 90 },
export const IMAGE_PRESETS = {};

// Used by SanityImage when no preset or customSize is given.
export const DEFAULT_IMAGE_SIZE = { width: 1920, height: 1080, quality: 90 };
