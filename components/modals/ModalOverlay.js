'use client';

import { motion } from 'framer-motion';

const ModalOverlay = ({ children, isOpen, onClose }) => {
	return (
		<>
			{isOpen && (
				<motion.div
					className='fixed inset-0 bg-light/80 backdrop-blur-sm flex items-center justify-center z-50'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.3 }}
					onClick={onClose}
				>
					{children}
				</motion.div>
			)}
		</>
	);
};

export default ModalOverlay;
