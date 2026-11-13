'use client';

/**
 * BUTTON KIT 3 — Growing-Line Arrow
 * -----------------------------------
 * The arrowhead stays put; the line behind it stretches (scaleX) on hover,
 * and the label goes italic. No side-swap, no slot animation — one arrow
 * that visually "reaches" further on hover.
 *
 * Colors below are placeholder starter-theme tokens — swap for the
 * client's actual palette once this kit is chosen.
 */

import Link from 'next/link';
import clsx from 'clsx';
import { track } from '@vercel/analytics';
import { useEffect, useRef } from 'react';

function ArrowPrimary() {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1.3em'
			height='1em'
			viewBox='-8 0 25 13'
			fill='none'
			style={{ overflow: 'visible' }}
		>
			<line
				x1='15.5'
				y1='6.03027'
				x2='0'
				y2='6.03027'
				stroke='currentColor'
				strokeWidth='1.5'
				className='transition-transform duration-300 group-hover:[transform:scaleX(1.6)]'
				style={{ transformOrigin: '15.5px 6.03px' }}
			/>
			<path
				d='M10 0.530273L15.5 6.03027M15.5 6.03027L10 11.5303'
				stroke='currentColor'
				strokeWidth='1.5'
			/>
		</svg>
	);
}

function ArrowSecondary() {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			width='1.3em'
			height='1em'
			viewBox='-8 0 24 12'
			fill='none'
			style={{ overflow: 'visible' }}
		>
			<line
				x1='15'
				y1='5.85449'
				x2='0'
				y2='5.85449'
				stroke='currentColor'
				strokeWidth='1'
				className='transition-transform duration-300 group-hover:[transform:scaleX(1.6)]'
				style={{ transformOrigin: '15px 5.85px' }}
			/>
			<path
				d='M9.46881 0.354492L15 5.85449M15 5.85449L9.46881 11.3545'
				stroke='currentColor'
				strokeWidth='1'
			/>
		</svg>
	);
}

const VARIANTS = {
	'primary-on-light': {
		classes: 'border border-primary text-primary hover:bg-primary hover:text-light',
		Arrow: ArrowPrimary,
	},
	'primary-on-dark': {
		classes: 'bg-light text-primary hover:bg-accent',
		Arrow: ArrowPrimary,
	},
	'secondary-on-light': { classes: 'text-primary', Arrow: ArrowSecondary },
	'secondary-on-dark': { classes: 'text-light', Arrow: ArrowSecondary },
};

/**
 * @param {string} href - The destination link.
 * @param {string} variant - One of: 'primary-on-light', 'primary-on-dark', 'secondary-on-light', 'secondary-on-dark'.
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

	const { classes, Arrow } = VARIANTS[variant];

	const combined = clsx(
		'group inline-flex items-center justify-center gap-[0.75rem] text-button uppercase rounded transition-all duration-300 hover:italic py-[0.62rem] px-[1rem]',
		classes,
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
			<Arrow />
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
