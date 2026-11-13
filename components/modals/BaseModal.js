'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

const backdropVariants = {
	visible: { opacity: 1 },
	hidden: { opacity: 0 },
};

const modalVariants = {
	hidden: { opacity: 0, y: 40, scale: 0.98 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { duration: 0.5, ease: 'easeOut' },
	},
	exit: {
		opacity: 0,
		y: 20,
		scale: 0.85,
		transition: { duration: 0.12, ease: 'easeIn' },
	},
};

const BaseModal = ({
	isOpen,
	onClose,
	children,
	className = '',
	backdropClass = 'bg-dark/60 backdrop-blur-sm',
}) => {
	const [mounted, setMounted] = useState(false);
	const modalRootRef = useRef(null);

	useEffect(() => {
		setMounted(true);
		modalRootRef.current = document.getElementById('modal-root');

		// Fallback in case it doesn't exist
		if (!modalRootRef.current) {
			const el = document.createElement('div');
			el.id = 'modal-root';
			document.body.appendChild(el);
			modalRootRef.current = el;
		}
	}, [isOpen]);

	if (!mounted || !modalRootRef.current) return null;

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className='fixed inset-0 z-50 flex items-center justify-center'
					initial='hidden'
					animate='visible'
					exit='hidden'
				>
					{/* Backdrop */}
					<motion.div
						className={`absolute inset-0 ${backdropClass}`}
						variants={backdropVariants}
						onClick={onClose}
						initial='hidden'
						animate='visible'
						exit='hidden'
					/>

					{/* Modal panel */}
					<motion.div
						className={`relative z-10 w-full max-w-xl mx-auto rounded bg-light p-6 shadow-lg ${className}`}
						variants={modalVariants}
						initial='hidden'
						animate='visible'
						exit='exit'
					>
						{children}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		modalRootRef.current
	);
};

export default BaseModal;
