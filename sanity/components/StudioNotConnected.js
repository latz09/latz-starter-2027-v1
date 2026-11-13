// sanity/components/StudioNotConnected.js
// Shown at /latz-studio when NEXT_PUBLIC_SANITY_PROJECT_ID is empty, instead
// of letting the Studio crash on a missing project. Inline styles on purpose:
// the Studio route doesn't load globals.css or Tailwind.

const box = {
	minHeight: '100vh',
	display: 'grid',
	placeItems: 'center',
	background: '#111827',
	color: '#f9fafb',
	fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
	padding: '2rem',
};

const code = {
	background: '#1f2937',
	padding: '0.15rem 0.4rem',
	borderRadius: '4px',
	fontSize: '0.9em',
};

export default function StudioNotConnected() {
	return (
		<main style={box}>
			<div style={{ maxWidth: '36rem', lineHeight: 1.5 }}>
				<h1 style={{ fontSize: '1.5rem', margin: '0 0 1rem', color: '#18a1ad' }}>
					Sanity isn&apos;t connected yet
				</h1>
				<p>
					This copy of the starter has no Sanity project ID. Run{' '}
					<span style={code}>npm run new-client</span> to provision one, or add{' '}
					<span style={code}>NEXT_PUBLIC_SANITY_PROJECT_ID</span> to{' '}
					<span style={code}>.env.local</span> and restart{' '}
					<span style={code}>npm run dev</span>.
				</p>
				<p style={{ opacity: 0.7 }}>The site itself runs on placeholder content until then.</p>
			</div>
		</main>
	);
}
