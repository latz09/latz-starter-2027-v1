// app/layout.js
// Minimal root layout shared by the site AND the embedded Studio. Keep it
// bare: no globals.css, no nav/footer, no analytics. Those live in
// app/(site)/layout.js via SiteShell so they never wrap /latz-studio.
//
// Fonts are loaded here (on <html>) so the CSS variable is defined at the
// document root. /theme swaps the font; keep the variable name --font-heading
// (and add --font-body only for a split-font style guide).

import { Fustat } from 'next/font/google';

const headingFont = Fustat({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-heading',
});

export default function RootLayout({ children }) {
	return (
		<html lang='en' className={headingFont.variable}>
			<body>{children}</body>
		</html>
	);
}
