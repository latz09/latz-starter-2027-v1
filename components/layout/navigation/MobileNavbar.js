// components/modals/MobileNavbar.js
'use client';

import { track } from '@vercel/analytics';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MenuIcon from './MenuIcon';
import Logo from '../../lib/Logo';
import { DARK_NAV_ROUTES } from '@/data/config/navigation';

const EASE = [0.25, 0.46, 0.45, 0.94];
const PANEL_ID = 'mobile-nav-panel';

// Mobile menu panel colors — edit these to re-theme for a new client.
// Everything the open panel touches (overlay, panel bg/border, link
// numbers/text, divider, CTA button) reads from here.
const PANEL_THEME = {
	overlay: 'bg-light/75',
	panelBg: 'bg-light',
	panelBorder: 'border-primary/20',
	linkNumber: 'text-primary',
	linkText: 'text-dark',
	linkHover: 'group-hover:text-primary',
	linkDivider: 'border-light/10',
	ctaBg: 'bg-primary border border-primary',
	ctaText: 'text-white',
	ctaHover: 'hover:bg-light hover:text-dark',
};

const MobileNavbar = ({ navLinks = [], logoUrl }) => {
	const [isNavOpen, setIsNavOpen] = useState(false);
	const pathname = usePathname();
	const isDark = DARK_NAV_ROUTES.includes(pathname);
	const isNavigatingAway = useRef(false);
	const panelRef = useRef(null);
	const previousFocusRef = useRef(null);

	const toggleNav = () => setIsNavOpen((prev) => !prev);

	const handleClose = () => {
		isNavigatingAway.current = false;
		setIsNavOpen(false);
	};

	const handleNavClick = (label, url) => {
		track(`CTA Click - Mobile Nav - ${label}`, { destination: url, buttonText: label });
		isNavigatingAway.current = true;
		setIsNavOpen(false);
	};

	const mainLinks = navLinks.filter((link) => !link.isButton);
	const contactLink = navLinks.find((link) => link.isButton);

	// Scroll lock (unchanged)
	useEffect(() => {
		if (isNavOpen) {
			const scrollY = window.scrollY;
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollY}px`;
			document.body.style.left = '0';
			document.body.style.right = '0';
			document.body.style.overflow = 'hidden';
			document.body.dataset.scrollY = scrollY;
		} else {
			const scrollY = document.body.dataset.scrollY || '0';
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.left = '';
			document.body.style.right = '';
			document.body.style.overflow = '';

			if (!isNavigatingAway.current) {
				window.scrollTo(0, parseInt(scrollY, 10));
			}
			isNavigatingAway.current = false;
		}
	}, [isNavOpen]);

	// Keyboard/focus behavior for the open panel — Escape closes it, focus
	// moves into the panel on open, and returns to whatever triggered it
	// (the menu button) on close. Standard modal-dialog behavior.
	useEffect(() => {
		if (!isNavOpen) return;

		previousFocusRef.current = document.activeElement;
		panelRef.current?.focus();

		const handleKeyDown = (e) => {
			if (e.key === 'Escape') handleClose();
		};
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			previousFocusRef.current?.focus?.();
		};
	}, [isNavOpen]);

	const overlayVariants = { closed: { opacity: 0 }, open: { opacity: 1 } };
	const menuVariants = { closed: { x: '100%' }, open: { x: '0%' } };
	const linkContainerVariants = {
		closed: { opacity: 0 },
		open: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
	};
	const linkVariants = {
		closed: { x: 32, opacity: 0 },
		open: { x: 0, opacity: 1, transition: { duration: 0.5, ease: EASE } },
	};

	return (
		<div
			className={`w-full lg:hidden flex items-center justify-between backdrop-blur-lg h-[var(--nav-h)] ${
				isDark ? 'bg-dark/90' : 'bg-light/[44%]'
			}`}
		>
			<div className='relative z-20 w-full section-x-padding'>
				<header className='flex items-center justify-between'>
					<Logo className='w-[4rem]' variant={isDark ? 'white' : 'vertical'} url={logoUrl} />
					<MenuIcon
						isNavOpen={isNavOpen}
						toggleNav={toggleNav}
						variant={isNavOpen ? 'dark' : isDark ? 'light' : 'dark'}
						controls={PANEL_ID}
					/>
				</header>
			</div>

			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{isNavOpen && (
							<>
								<motion.div
									className={`fixed inset-0 backdrop-blur z-overlay ${PANEL_THEME.overlay}`}
									variants={overlayVariants}
									initial='closed'
									animate='open'
									exit='closed'
									transition={{ duration: 0.35, ease: EASE }}
									onClick={handleClose}
								/>

								<motion.nav
									id={PANEL_ID}
									ref={panelRef}
									tabIndex={-1}
									className={`fixed top-0 right-0 h-full w-[85%] max-w-[500px] z-modal shadow-lifted border-l overflow-hidden outline-none ${PANEL_THEME.panelBg} ${PANEL_THEME.panelBorder}`}
									variants={menuVariants}
									initial='closed'
									animate='open'
									exit='closed'
									transition={{ duration: 0.5, ease: EASE }}
									onClick={(e) => e.stopPropagation()}
									role='dialog'
									aria-modal='true'
									aria-label='Mobile navigation menu'
								>
									<div className='relative z-10 flex flex-col h-full px-1 py-1'>
										<motion.div
											initial={{ opacity: 0, y: -10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: 0.15, duration: 0.4, ease: EASE }}
											className='flex items-center justify-end my-2'
										>
											<MenuIcon isNavOpen={isNavOpen} toggleNav={handleClose} variant='dark' controls={PANEL_ID} />
										</motion.div>

										<motion.ul
											className='flex-1 space-y-0.5'
											variants={linkContainerVariants}
											initial='closed'
											animate='open'
										>
											{mainLinks.map((link, index) => (
												<motion.li key={index} variants={linkVariants}>
													<Link
														href={link.url}
														onClick={() => handleNavClick(link.label, link.url)}
														className={`group relative flex items-center justify-between py-0.75 border-b ${PANEL_THEME.linkDivider}`}
													>
														<span className='flex items-baseline gap-0.75'>
															<h4 className={`${PANEL_THEME.linkNumber} font-[700] tracking-wide`}>
																{String(index + 1).padStart(2, '0')}
															</h4>
															<h5 className={`${PANEL_THEME.linkText} transition-colors duration-300 ${PANEL_THEME.linkHover}`}>
																{link.label}
															</h5>
														</span>
													</Link>
												</motion.li>
											))}
										</motion.ul>

										{contactLink && (
											<motion.div
												initial={{ y: 20, opacity: 0 }}
												animate={{ y: 0, opacity: 1 }}
												transition={{ delay: 0.55, duration: 0.45, ease: EASE }}
												className='pt-xs'
											>
												<Link
													href={contactLink.url}
													onClick={() => handleNavClick(contactLink.label, contactLink.url)}
													className={`w-full text-button inline-flex items-center justify-center rounded-sm transition-all duration-500 py-0.75 px-1.25 ${PANEL_THEME.ctaBg} ${PANEL_THEME.ctaText} ${PANEL_THEME.ctaHover}`}
												>
													{contactLink.label}
												</Link>
											</motion.div>
										)}
									</div>
								</motion.nav>
							</>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</div>
	);
};

export default MobileNavbar;