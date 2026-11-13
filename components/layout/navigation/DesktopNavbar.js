'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { track } from '@vercel/analytics';
import Logo from '@/components/lib/Logo';
import { DARK_NAV_ROUTES } from '@/data/config/navigation';

const DesktopNavbar = ({ navLinks, logoUrl }) => {
	const pathname = usePathname();
	const isDark = DARK_NAV_ROUTES.includes(pathname);
	const mainLinks = navLinks.filter((link) => !link.isButton);
	const contactLink = navLinks.find((link) => link.isButton);

	const handleNavClick = (label, url) => {
		track(`CTA Click - Navbar - ${label}`, { destination: url, buttonText: label });
	};

	return (
		<div
			className={`hidden h-full lg:flex items-center backdrop-blur-lg w-full  ${
				isDark ? 'bg-dark/90' : 'bg-light/[44%]'
			}`}
		>
			<div className='flex items-center w-full section-x-padding '>
				<Logo className='w-6' variant={isDark ? 'white' : 'vertical'} url={logoUrl} />
				<nav className='flex gap-2 items-center ml-auto'>
					{mainLinks.map((link, index) => (
						<Link
							key={index}
							href={link.url}
							onClick={() => handleNavClick(link.label, link.url)}
							className={`block text-button transition-all duration-200 cursor-pointer hover:underline hover:underline-offset-2 ${
								isDark ? 'text-light' : ''
							}`}
						>
							{link.label}
						</Link>
					))}
					{contactLink && (
						<Link
							href={contactLink.url}
							onClick={() => handleNavClick(contactLink.label, contactLink.url)}
							className={`block text-button transition-all duration-200 cursor-pointer border px-1.25 py-0.75 rounded ${
								isDark
									? 'border-light bg-light text-dark hover:bg-dark hover:text-light'
									: 'border-dark bg-dark text-white hover:bg-light hover:text-dark'
							}`}
						>
							{contactLink.label}
						</Link>
					)}
				</nav>
			</div>
		</div>
	);
};

export default DesktopNavbar;