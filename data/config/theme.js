// data/config/theme.js
// Drives the /design preview (Colors + Typography tabs) so what you see there
// matches THIS client's real design system. `npm run theme` regenerates the
// block between the markers from docs/style-guide/tokens.json: the color slots
// keep the guide's names, and `typography` lists exactly the guide's styles in
// order (so a client with Paragraph Large + Small, or no Overline, shows just
// what it actually has). Hexes are read live from tailwind.config.js, not here.
//
// `tag` is the element rendered in the preview; `className` is the style applied
// to it (null for h1-h6, whose base rule already styles the tag). Edit by hand
// if you theme without /theme, or just re-run `npm run theme`.

export const themePreview = {
	/* @gen:themePreview start */
	colors: [
		{ name: 'Primary', slot: 'primary' },
		{ name: 'Secondary', slot: 'secondary' },
		{ name: 'Tertiary', slot: 'tertiary' },
		{ name: 'Accent', slot: 'accent' },
		{ name: 'Dark', slot: 'dark' },
		{ name: 'Light', slot: 'light' },
	],
	typography: [
		{ label: 'Hero Title', tag: 'h1', className: 'hero-title', sample: 'Hero Title' },
		{ label: 'H1', tag: 'h1', className: null, sample: 'Heading 1' },
		{ label: 'H2', tag: 'h2', className: null, sample: 'Heading 2' },
		{ label: 'H3', tag: 'h3', className: null, sample: 'Heading 3' },
		{ label: 'H4', tag: 'h4', className: null, sample: 'Heading 4' },
		{ label: 'H5', tag: 'h5', className: null, sample: 'Heading 5' },
		{ label: 'H6', tag: 'h6', className: null, sample: 'Heading 6' },
		{ label: 'Overline', tag: 'p', className: 'text-overline', sample: 'OVERLINE TEXT' },
		{
			label: 'Subheading',
			tag: 'p',
			className: 'text-subheading',
			sample: 'This is a subheading for additional context',
		},
		{
			label: 'Paragraph',
			tag: 'p',
			className: 'text-paragraph',
			sample:
				'This is body text for longer paragraphs and general content. It is designed for readability and comfortable reading at various screen sizes.',
		},
		{
			label: 'Caption',
			tag: 'p',
			className: 'text-caption',
			sample: 'This is caption text for small details',
		},
		{ label: 'Button Text', tag: 'p', className: 'text-button', sample: 'BUTTON TEXT' },
	],
	/* @gen:themePreview end */
};
