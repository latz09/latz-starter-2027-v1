'use client';

/**
 * BUTTON KIT 2 — Swap-Side Arrow
 * -------------------------------
 * Right arrow shows by default. On hover it fades/collapses out to the
 * right while a left arrow expands in from the left — the arrow swaps
 * sides. Pure Tailwind + CSS custom properties, no JS state, no Framer
 * Motion, no hydration flash.
 *
 * NOTE: this exact visual idea has shown up 3 different ways across past
 * projects (this CSS-only version, a useState + inline-style version, and
 * a Framer Motion version). This is the canonical one going forward —
 * lighter, and the animation is declared once in CSS instead of re-derived
 * in JS per project.
 *
 * Colors below are placeholder starter-theme tokens — swap for the
 * client's actual palette once this kit is chosen.
 */

import Link from 'next/link';
import clsx from 'clsx';
import { track } from '@vercel/analytics';
import { useEffect, useRef } from 'react';

const VARIANTS = {
	'primary-on-light':
		'px-1.25 lg:px-1.5 bg-primary text-light hover:bg-secondary hover:text-dark',
	'primary-on-dark':
		'px-1.25 lg:px-1.5 bg-secondary text-dark hover:bg-primary hover:text-light',
	'secondary-on-light': 'text-primary',
	'secondary-on-dark': 'text-light',
};

// stroke="currentColor" makes the arrow follow the button's text color
// in every state — no per-variant arrow needed.
// Size comes from the --aw var (set responsively on the root); height keeps
// the original aspect ratio.
function Arrow({ className = '' }) {
	return (
		<svg
			xmlns='http://www.w3.org/2000/svg'
			viewBox='0 0 16 16'
			fill='none'
			aria-hidden='true'
			className={clsx(
				'shrink-0 w-[var(--aw)] h-[calc(var(--aw)_*_1.0749)]',
				className,
			)}
		>
			<path
				d='M5.35589e-05 1.25H14.709L14.709 15.959M14.709 1.25L1.02452 14.9345'
				stroke='currentColor'
				strokeWidth='2.5'
			/>
		</svg>
	);
}

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

	// --aw = arrow width, --ag = arrow gap. Both scale up at sm/md breakpoints.
	const baseStyles =
		'group text-button inline-flex items-center justify-center rounded transition-all duration-500 py-[0.67rem] lg:py-0.75 ' +
		'[--aw:0.95rem] [--ag:0.56rem] ' +
		'sm:[--aw:1.08rem] sm:[--ag:0.64rem] ' +
		'md:[--aw:1.20956rem] md:[--ag:0.72rem]';

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

	// Left slot: zero-width by default, expands on hover.
	// Right slot: open by default, collapses on hover.
	// Both slots always exist so there's no layout reflow.
	const content = (
		<>
			<span className='inline-flex w-0 opacity-0 transition-all duration-300 ease-out group-hover:mr-[var(--ag)] group-hover:w-[var(--aw)] group-hover:opacity-100'>
				<Arrow />
			</span>

			<span className='transition-all duration-500'>{children}</span>

			<span className='ml-[var(--ag)] inline-flex w-[var(--aw)] opacity-100 transition-all duration-300 ease-out group-hover:ml-0 group-hover:w-0 group-hover:opacity-0'>
				<Arrow />
			</span>
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
		<Link href={href} onClick={handleClick} className={combined} {...props}>
			{content}
		</Link>
	);
}
