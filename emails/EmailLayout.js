// /emails/EmailLayout.js
import { Html, Head, Preview, Body, Container, Section, Img, Link, Text } from '@react-email/components';

// Shared shell for every client's transactional emails.
// Per-client look is driven entirely by the `branding` object (colors, logo, name) —
// this file itself should never need to change between clients.

export function EmailLayout({ branding, previewText, footer, children }) {
	const { colors, logoUrl, name } = branding;

	return (
		<Html>
			<Head />
			{previewText && <Preview>{previewText}</Preview>}
			<Body style={outerBody}>
				<Container style={container}>
					<Section style={topBar(colors)}>
						<Text style={topBarSpacer}>&nbsp;</Text>
					</Section>

					<Section style={header(colors)}>
						<Img src={logoUrl} alt={`${name} Logo`} style={logo} />
					</Section>

					<Section style={body(colors)}>{children}</Section>

					<Section style={footerWrap(colors)}>{footer}</Section>

					<Section style={poweredBy}>
						<Link
							href='https://www.latzwebdesign.com'
							style={poweredByLink}
						>
							Powered by <strong>Latz Web Design</strong>
						</Link>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const outerBody = {
	backgroundColor: '#f3f4f6',
	margin: 0,
	padding: '24px 0',
	fontFamily:
		"-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

const container = {
	maxWidth: '600px',
	margin: '0 auto',
	backgroundColor: '#ffffff',
	border: '1px solid #e5e7eb',
	borderRadius: '8px',
	overflow: 'hidden',
};

const header = (colors) => ({
	backgroundColor: colors.background,
	padding: '32px 24px',
	textAlign: 'center',
	borderBottom: '1px solid #e5e7eb',
});

const topBar = (colors) => ({
	backgroundColor: colors.accent,
	padding: 0,
});

const topBarSpacer = {
	margin: 0,
	fontSize: '1px',
	lineHeight: '4px',
};

const logo = { maxWidth: '250px', margin: '0 auto' };

const body = (colors) => ({
	backgroundColor: colors.background,
	padding: '32px 24px',
	color: colors.text,
});

const footerWrap = (colors) => ({
	backgroundColor: colors.background,
	padding: '24px',
	textAlign: 'center',
});

const poweredBy = {
	textAlign: 'center',
	padding: '20px 24px',
	fontSize: '12px',
	color: '#9ca3af',
	backgroundColor: '#f9fafb',
	borderTop: '1px solid #e5e7eb',
};

const poweredByLink = {
	color: '#6b7280',
	textDecoration: 'none',
	fontWeight: 500,
};