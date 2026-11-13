'use client';

// sanity/components/CustomLayout.js
// Wraps the whole Studio with a "Powered by Latz Web Design" footer and a
// help popup (copy support email + link to the client's CMS guide page).
// Values come from sanity/branding.js, nothing per-client lives in here.

import { forwardRef, useState } from 'react';
import { branding } from '../branding';

const { colors, support, cmsGuideUrl } = branding;

const FONT =
	'"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const CustomLayout = forwardRef((props, ref) => {
	const [showPopup, setShowPopup] = useState(false);
	const [copied, setCopied] = useState(false);

	const handleBrandClick = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setShowPopup(!showPopup);
	};

	const handleEmailCopy = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			await navigator.clipboard.writeText(support.email);
		} catch {
			console.log(`Email: ${support.email}`);
		}
		setCopied(true);
		setTimeout(() => {
			setCopied(false);
			setShowPopup(false);
		}, 2000);
	};

	return (
		<div
			ref={ref}
			style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}
		>
			<div style={{ flex: 1, minHeight: 0, overflow: 'auto' }}>
				{props.renderDefault(props)}
			</div>

			<footer
				style={{
					flexShrink: 0,
					padding: '10px 20px',
					background: colors.dark,
					borderTop: `1px solid ${colors.primary}`,
					textAlign: 'center',
					fontSize: '12px',
					position: 'relative',
					zIndex: 1000,
					fontFamily: FONT,
				}}
			>
				<span style={{ color: colors.light }}>
					Powered by{' '}
					<strong
						style={{
							color: colors.primary,
							cursor: 'pointer',
							textDecoration: 'underline',
							userSelect: 'none',
						}}
						onClick={handleBrandClick}
					>
						Latz Web Design
					</strong>{' '}
					<span
						style={{ cursor: 'pointer', fontSize: '14px', userSelect: 'none' }}
						onClick={handleBrandClick}
					>
						&#9432;
					</span>
				</span>

				{showPopup && (
					<>
						<div
							style={{ position: 'fixed', inset: 0, zIndex: 9999 }}
							onClick={() => setShowPopup(false)}
						/>
						<div
							style={{
								position: 'fixed',
								bottom: '60px',
								left: '50%',
								transform: 'translateX(-50%)',
								background: colors.light,
								border: `2px solid ${colors.primary}`,
								borderRadius: '8px',
								padding: '20px',
								boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
								zIndex: 10000,
								minWidth: '280px',
								fontFamily: FONT,
							}}
						>
							<div
								style={{
									color: colors.dark,
									marginBottom: '14px',
									fontWeight: 'bold',
									fontSize: '14px',
								}}
							>
								Need Help?
							</div>

							<button
								style={{
									color: copied ? colors.light : colors.dark,
									cursor: 'pointer',
									padding: '10px 12px',
									background: copied ? colors.primary : 'transparent',
									borderRadius: '4px',
									border: `1px solid ${colors.primary}`,
									width: '100%',
									fontSize: '12px',
									fontWeight: copied ? 'bold' : 'normal',
									fontFamily: 'inherit',
								}}
								onClick={handleEmailCopy}
							>
								{copied ? '✓ Copied to Clipboard!' : `📧  ${support.email}`}
							</button>

							{cmsGuideUrl && (
								<a
									href={cmsGuideUrl}
									target='_blank'
									rel='noopener noreferrer'
									style={{
										display: 'block',
										color: colors.light,
										padding: '10px 12px',
										background: colors.dark,
										borderRadius: '4px',
										border: `1px solid ${colors.primary}`,
										width: '100%',
										fontSize: '12px',
										fontFamily: 'inherit',
										textAlign: 'center',
										textDecoration: 'none',
										marginTop: '8px',
										boxSizing: 'border-box',
									}}
									onClick={(e) => e.stopPropagation()}
								>
									📖 How to Edit Your Website
								</a>
							)}

							<a
								href={support.siteUrl}
								target='_blank'
								rel='noopener noreferrer'
								style={{
									display: 'block',
									color: colors.gray,
									fontSize: '11px',
									textAlign: 'center',
									marginTop: '12px',
									textDecoration: 'none',
									fontFamily: 'inherit',
								}}
								onClick={(e) => e.stopPropagation()}
							>
								{support.siteUrl.replace(/^https?:\/\//, '')}
							</a>
						</div>
					</>
				)}
			</footer>
		</div>
	);
});

CustomLayout.displayName = 'CustomLayout';

export default CustomLayout;
