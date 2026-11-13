// app/layout.js
// Minimal root layout shared by the site AND the embedded Studio. Keep it
// bare: no globals.css, no nav/footer, no analytics. Those live in
// app/(site)/layout.js via SiteShell so they never wrap /latz-studio.
//
// Fonts are loaded here (on <html>) so the CSS variable is defined at the
// document root. `npm run theme` rewrites the block between the markers from
// docs/style-guide/tokens.json: it keeps the variable name --font-heading
// (and adds --font-body for a split-font style guide), and always sets
// `fontVars` to the class string the <html> below applies. Keep the markers
// and keep className={fontVars}.

/* @gen:fontImport start */
import { Fustat } from 'next/font/google';

const headingFont = Fustat({
	subsets: ['latin'],
	weight: ['400', '500', '600', '700'],
	display: 'swap',
	variable: '--font-heading',
});

const fontVars = headingFont.variable;
/* @gen:fontImport end */

export default function RootLayout({ children }) {
	return (
		<html lang='en' className={fontVars}>
			<body>{children}</body>
		</html>
	);
}
