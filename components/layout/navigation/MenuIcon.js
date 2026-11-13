'use client';

import { motion } from 'framer-motion';

// `controls` should be the id of the panel this button opens/closes —
// pairs the trigger to the panel for assistive tech (aria-controls).
const MenuIcon = ({ toggleNav, isNavOpen, variant = 'dark', controls }) => {
	const lineColor = variant === 'light' ? 'bg-light' : 'bg-dark';

	return (
		<button
			type='button'
			className='z-[99999] text-3xl'
			onClick={toggleNav}
			aria-expanded={isNavOpen}
			aria-controls={controls}
			aria-label={isNavOpen ? 'Close menu' : 'Open menu'}
		>
			<motion.div
				className='cursor-pointer'
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
			>
				<div className='flex flex-col space-y-0.25'>
					<span
						className={`block w-2 h-0.25 ${lineColor} transition-all duration-300 origin-center ${
							isNavOpen ? 'rotate-45 translate-y-[0.5rem]' : ''
						}`}
					/>
					<span
						className={`block w-2 h-0.25 ${lineColor} transition-all duration-300 ${
							isNavOpen ? 'opacity-0' : ''
						}`}
					/>
					<span
						className={`block w-2 h-0.25 ${lineColor} transition-all duration-300 origin-center ${
							isNavOpen ? '-rotate-45 -translate-y-[0.5rem]' : ''
						}`}
					/>
				</div>
			</motion.div>
		</button>
	);
};

export default MenuIcon;