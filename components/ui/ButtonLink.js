// STARTER TEMPLATE BUTTON

'use client';

import Link from 'next/link';
import clsx from 'clsx';
import { track } from '@vercel/analytics';
import { useEffect, useRef } from 'react';

const VARIANTS = {
	// PRIMARY
	'primary-on-light': 'bg-primary text-light hover:opacity-90',
	'primary-on-dark': 'bg-primary text-light hover:opacity-90',
	// SECONDARY
	'secondary-on-light': 'bg-secondary text-dark hover:opacity-90',
	'secondary-on-dark': 'bg-secondary text-light hover:opacity-90',
	// TERTIARY
	'tertiary-on-light': 'bg-dark text-light hover:opacity-90 border border-light',
	'tertiary-on-dark': 'bg-light text-dark hover:opacity-90 border',
};

/**
 * Reusable button link component.
 * @param {string} href - The destination link.
 * @param {string} variant - One of: 'primary-on-light', 'primary-on-dark', 'secondary-on-light', 'secondary-on-dark', 'tertiary-on-light', 'tertiary-on-dark'.
 * @param {boolean} external - Whether to use target="_blank".
 * @param {string} className - Additional classes.
 * @param {string} event - Optional event name for Vercel Analytics tracking (automatically prefixed with "CTA Click - ").
 * @param {ReactNode} children - The button label.
 */

export default function ButtonLink({
	href = '/',
	variant = 'primary-light',
	external = false,
	className = '',
	event, // Pass short name like "Hero - Free Consultation", component adds "CTA Click - " prefix
	children,
	...props
}) {
	// Track when component mounts (page load time)
	const pageLoadTime = useRef(null);
	useEffect(() => {
		pageLoadTime.current = Date.now();
	}, []);

	const baseStyles =
	'text-button inline-flex items-center justify-center rounded transition-all duration-300 px-1.25 py-0.75';

	const combined = clsx(baseStyles, VARIANTS[variant], className);

	// Track button clicks in Vercel Analytics when event is provided
	// Automatically prefixes event with "CTA Click - " for consistent naming
	// Example: event="Hero - Free Consultation" → tracks as "CTA Click - Hero - Free Consultation"
	const handleClick = () => {
		if (event) {
			// Calculate time on page before click (in seconds)
			const timeOnPage = pageLoadTime.current
				? Math.round((Date.now() - pageLoadTime.current) / 1000)
				: 0;

			track(`CTA Click - ${event}`, {
				destination: href, // Where the button goes
				buttonText: typeof children === 'string' ? children : 'button', // Button label
				timeOnPage: `${timeOnPage}s`, // How long before they clicked
			});
		}
	};

if (external) {
	return (
		<a
			href={href}
			className={combined}
			target='_blank'
			rel='noopener noreferrer'
			onClick={handleClick}
			{...props}
		>
			{children}
			<span className='sr-only'> (opens in new tab)</span>
		</a>
	);
}

	return (
		<Link href={href} onClick={handleClick} className={combined} {...props}>
			{' '}
			{/* Triggers analytics tracking on click */}
			{children}
		</Link>
	);
}
