// app/not-found.js
// Root 404. Sits outside app/(site)/, so it pulls in globals.css and wraps
// itself in SiteShell to keep the nav and footer.
import '@/app/globals.css';
import SiteShell from '@/components/layout/SiteShell';
import Link from 'next/link';
import Section from '@/components/layout/Section';
import ButtonLink from '@/components/ui/ButtonLink';
import PageContainer from '@/components/animations/PageContainer';

export default function NotFound() {
	return (
		<SiteShell>
			<PageContainer>
				<Section className='min-h-[70svh] grid place-items-center text-center'>
					<div className='space-y-1.5'>
						<span className='text-overline'>Error 404</span>
						<h1 className=''>Page not found</h1>
						<p className='text-paragraph max-w-2xl mx-auto'>
							{`The page you're looking for doesn't exist or may have been moved.`}
						</p>

						<div className='flex flex-wrap items-center justify-center gap-1 pt-1'>
							<ButtonLink
								href='/'
								variant='primary-on-light'
								event='404 - Back to Home'
							>
								Back to Home
							</ButtonLink>
							<Link
								href='/contact'
								className='text-button underline underline-offset-2'
							>
								Contact Us
							</Link>
						</div>
					</div>
				</Section>
			</PageContainer>
		</SiteShell>
	);
}
