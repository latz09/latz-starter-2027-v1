// app/(site)/design/layout.js
// The design-system preview is a build tool, never a public page.
export const metadata = {
	robots: { index: false, follow: false },
};

export default function DesignLayout({ children }) {
	return children;
}
