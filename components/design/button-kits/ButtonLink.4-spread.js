'use client';

/**
 * BUTTON KIT 4 — Spread / Tertiary Layout
 * ------------------------------------------
 * Full-width, bordered, label and arrow pushed to opposite ends
 * (justify-between). Uses the same growing-line arrow idea as Kit 3, just
 * a different frame — this is for big standalone CTA buttons/banners,
 * not inline links.
 *
 * Colors below are placeholder starter-theme tokens — swap for the
 * client's actual palette once this kit is chosen.
 */

import Link from 'next/link';
import clsx from 'clsx';
import { track } from '@vercel/analytics';
import { useEffect, useRef } from 'react';

function ArrowTertiary() {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1.6em'
			height='1em'
			viewBox='-12 0 42 19'
			fill='none'
			style={{ overflow: 'visible' }}
		>
			<line
				x1='29'
				y1='9.5'
				x2='0.5'
				y2='9.5'
				stroke='currentColor'
				strokeWidth='1.5'
				strokeLinecap='round'
				className='transition-transform duration-300 group-hover:[transform:scaleX(1.4)]'
				style={{ transformOrigin: '29px 9.5px' }}
			/>
			<path
				d='M20 0.5L29 9.5M29 9.5L20 18.5'
				stroke='currentColor'
				strokeWidth='1.5'
				strokeLinecap='round'
				strokeLinejoin='round'
			/>
		</svg>
	);
}

const VARIANTS = {
	'tertiary-on-light': 'border border-dark text-dark hover:bg-dark hover:text-light',
	'tertiary-on-dark': 'border border-light text-light hover:bg-light hover:text-dark',
};

/**
 * @param {string} href - The destination link.
 * @param {string} variant - One of: 'tertiary-on-light', 'tertiary-on-dark'.
 * @param {boolean} external - Whether to use target="_blank".
 * @param {string} className - Additional classes.
 * @param {string} event - Optional event name for Vercel Analytics tracking (automatically prefixed with "CTA Click - ").
 * @param {ReactNode} children - The button label.
 */
export default function ButtonLink({
	href = '/',
	variant = 'tertiary-on-light',
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

	const combined = clsx(
		'group inline-flex items-center justify-between w-full gap-[3.5rem] lg:gap-[7rem] rounded text-button transition-all duration-300 hover:italic px-1.5 py-1',
		VARIANTS[variant],
		className,
	);

	const handleClick = () => {
		if (!event) return;
		const timeOnPage = pageLoadTime.current
			? Math.round((Date.now() - pageLoadTime.current) / 1000)
			: 0;
		track(`CTA Click - ${event}`, {
			destination: href,
			buttonText: typeof children === 'string' ? children : 'button',
			timeOnPage: `${timeOnPage}s`,
		});
	};

	const content = (
		<>
			<span>{children}</span>
			<ArrowTertiary />
		</>
	);

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
				{content}
			</a>
		);
	}

	return (
		<Link href={href} className={combined} onClick={handleClick} {...props}>
			{content}
		</Link>
	);
}
