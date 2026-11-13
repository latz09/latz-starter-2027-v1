'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import MobileNavbar from './MobileNavbar';
import DesktopNavbar from './DesktopNavbar';

const StickyNav = ({ navLinks, logoUrl }) => {
	const [hidden, setHidden] = useState(false);
	const threshold = useRef(0);
	const { scrollY } = useScroll();

	useEffect(() => {
		const setThreshold = () => {
			threshold.current = window.innerHeight * 0.75;
		};
		setThreshold();
		window.addEventListener('resize', setThreshold);
		return () => window.removeEventListener('resize', setThreshold);
	}, []);

	useMotionValueEvent(scrollY, 'change', (latest) => {
		const previous = scrollY.getPrevious();
		if (latest < threshold.current) {
			setHidden(false);
			return;
		}
		setHidden(latest > previous);
	});

	return (
		<motion.nav
			className='fixed top-0 left-0 w-full z-50 flex items-center h-[var(--nav-h)] '
			animate={hidden ? 'hidden' : 'visible'}
			variants={{ visible: { y: 0 }, hidden: { y: '-100%' } }}
			transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
		>
			<MobileNavbar navLinks={navLinks} logoUrl={logoUrl} />
			<DesktopNavbar navLinks={navLinks} logoUrl={logoUrl} />
		</motion.nav>
	);
};

export default StickyNav;