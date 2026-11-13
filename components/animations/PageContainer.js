'use client';

import { motion } from 'framer-motion';

const PageContainer = ({ children, className }) => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.75 }}
			className={`${className} `}
		>
			{children}
		</motion.div>
	);
};

export default PageContainer;