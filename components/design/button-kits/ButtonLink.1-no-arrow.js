'use client';

/**
 * BUTTON KIT 1 — No Arrow
 * ------------------------
 * Just a background/text color swap on hover. No arrow, no motion beyond
 * the color transition. This is the starter template's current default
 * (components/ui/ButtonLink.js) — included here so it's directly
 * comparable against the other kits.
 */

import Link from 'next/link';
import clsx from 'clsx';
import { track } from '@vercel/analytics';
import { useEffect, useRef } from 'react';

const VARIANTS = {
	// PRIMARY
	'primary-on-light': 'bg-primary text-light hover:opacity-90',
	'primary-on-dark': 'bg-primary text-light hover:opacity-90',
	// SECONDARY
	'secondary-on-light': 'bg-secondary text-light hover:opacity-90',
	'secondary-on-dark': 'bg-secondary text-light hover:opacity-90',
	// TERTIARY
	'tertiary-on-light': 'bg-dark text-light hover:opacity-90 border border-light',
	'tertiary-on-dark': 'bg-light text-dark hover:opacity-90 border',
};

/**
 * @param {string} href - The destination link.
 * @param {string} variant - One of: 'primary-on-light', 'primary-on-dark', 'secondary-on-light', 'secondary-on-dark', 'dark-on-light', 'light-on-dark'.
 * @param {boolean} external - Whether to use target="_blank".
 * @param {string} className - Additional classes.
 * @param {string} event - Optional event name for Vercel Analytics tracking (automatically prefixed with "CTA Click - ").
 * @param {ReactNode} children - The button label.
 */
export default function ButtonLink({
	href = '/',
	variant = 'primary-on-light',
	external = false,
	className = '',
	event,
	children,
	...props
}) {
	const pageLoadTime = useRef(null);
	useEffect(() => {
		pageLoadTime.current = Date.now();
	}, []);

	const baseStyles =
		'text-button inline-flex items-center justify-center rounded transition-all duration-300 px-1 py-0.5';

	const combined = clsx(baseStyles, VARIANTS[variant], className);

	const handleClick = () => {
		if (event) {
			const timeOnPage = pageLoadTime.current
				? Math.round((Date.now() - pageLoadTime.current) / 1000)
				: 0;

			track(`CTA Click - ${event}`, {
				destination: href,
				buttonText: typeof children === 'string' ? children : 'button',
				timeOnPage: `${timeOnPage}s`,
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
			</a>
		);
	}

	return (
		<Link href={href} onClick={handleClick} className={combined} {...props}>
			{children}
		</Link>
	);
}
