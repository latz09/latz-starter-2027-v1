'use client';

import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

function rgba(hex, a) {
	const n = hex.replace('#', '');
	const to = (s) => parseInt(s, 16);
	const r = n.length === 3 ? to(n[0] + n[0]) : to(n.slice(0, 2));
	const g = n.length === 3 ? to(n[1] + n[1]) : to(n.slice(2, 4));
	const b = n.length === 3 ? to(n[2] + n[2]) : to(n.slice(4, 6));
	return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export default function SlideShow({ openIndex, setOpenIndex, slides = [] }) {
	// Get color values from Tailwind config
	// Replace these with actual hex values from your client's brand
	const colors = {
		dark: '#001D20',
		primary: '#18a1ad',
		light: '#F8FEFF',
	};

	return (
		<Lightbox
			open={openIndex >= 0}
			close={() => setOpenIndex(-1)}
			index={openIndex}
			slides={slides}
			plugins={[Zoom, Thumbnails]}
			styles={{
				root: {
					'--yarl__color_backdrop': rgba(colors.dark, 0.96),
					'--yarl__slide_title_color': colors.light,
					'--yarl__slide_description_color': rgba(colors.light, 0.95),
					'--yarl__color_button': colors.light,
					'--yarl__color_button_hover': colors.primary,
					'--yarl__color_button_active': colors.primary,
					'--yarl__thumbnails_container_background_color': rgba(colors.dark, 0.55),
					'--yarl__thumbnails_track_background_color': rgba(colors.dark, 0.55),
					'--yarl__thumbnails_thumbnail_background_color': colors.light,
					'--yarl__thumbnails_thumbnail_border_color': rgba(colors.primary, 0.3),
					'--yarl__thumbnails_thumbnail_border_color_active': colors.primary,
					'--yarl__thumbnails_thumbnail_border_radius': '6px',
					'--yarl__thumbnails_thumbnail_padding': '3px',
					'--yarl__navigation_button_size': '48px',
					'--yarl__navigation_button_border_radius': '9999px',
					'--yarl__loading_indicator_color': colors.primary,
				},
				thumbnail: {
					backgroundColor: colors.light,
					border: `1px solid ${rgba(colors.primary, 0.3)}`,
					borderRadius: '6px',
					boxShadow: `0 1px 3px ${rgba('#000000', 0.12)}`,
					transition: 'transform 0.18s ease, box-shadow 0.18s ease',
				},
				navigationButton: {
					backgroundColor: rgba(colors.dark, 0.35),
					backdropFilter: 'blur(4px)',
					border: `1px solid ${rgba(colors.light, 0.18)}`,
					boxShadow: `0 4px 12px ${rgba('#000000', 0.25)}`,
					transition: 'transform 0.18s ease, background-color 0.18s ease',
				},
				toolbar: {
					backgroundColor: rgba(colors.dark, 0.7),
					backdropFilter: 'blur(6px)',
					borderBottom: `1px solid ${rgba(colors.light, 0.08)}`,
				},
			}}
		/>
	);
}