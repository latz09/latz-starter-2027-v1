import Section from '@/components/layout/Section';
import ButtonKit1 from '@/components/design/button-kits/ButtonLink.1-no-arrow';
import ButtonKit2 from '@/components/design/button-kits/ButtonLink.2-swap-side';
import ButtonKit3 from '@/components/design/button-kits/ButtonLink.3-grow-line';
import ButtonKit4 from '@/components/design/button-kits/ButtonLink.4-spread';

// Dev-only comparison page — not for client eyes, keep it out of search.
export const metadata = {
	robots: { index: false, follow: false },
};

const KITS = [
	{
		title: 'Kit 1 — No Arrow',
		description: 'Background/text color swap on hover. No arrow. (Current starter default.)',
		Button: ButtonKit1,
		primary: 'primary-on-light',
		primaryDark: 'primary-on-dark',
		secondary: 'secondary-on-light',
		secondaryDark: 'secondary-on-dark',
	},
	{
		title: 'Kit 2 — Swap-Side Arrow',
		description: 'Right arrow shows by default; on hover it swaps to a left arrow sliding in from the other side.',
		Button: ButtonKit2,
		primary: 'primary-on-light',
		primaryDark: 'primary-on-dark',
		secondary: 'secondary-on-light',
		secondaryDark: 'secondary-on-dark',
	},
	{
		title: 'Kit 3 — Growing-Line Arrow',
		description: 'Arrowhead stays put, the line behind it stretches on hover. Label goes italic.',
		Button: ButtonKit3,
		primary: 'primary-on-light',
		primaryDark: 'primary-on-dark',
		secondary: 'secondary-on-light',
		secondaryDark: 'secondary-on-dark',
	},
];

export default function ButtonKitsPreviewPage() {
	return (
		<Section className='max-w-container mx-auto px-1 py-3 space-y-4'>
			<div>
				<h1>Button Kits</h1>
				<p className='text-paragraph '>
					{`Hover each button to compare. Pick the one closest to the current
					design, copy that file's contents into`} {''}
					<code>components/ui/ButtonLink.js</code>, retheme the colors, then
					delete this folder and this preview page.
				</p>
			</div>

			{KITS.map(({ title, description, Button, primary, primaryDark, secondary, secondaryDark }) => (
				<section key={title} className='border-t pt-2 space-y-1.5'>
					<div>
						<h2 className='text-subheading'>{title}</h2>
						<p className='text-caption opacity-60'>{description}</p>
					</div>

					<div className='grid md:grid-cols-2 gap-1'>
						<div className='bg-light rounded p-1.5 flex flex-wrap items-center gap-1'>
							<Button href='#' variant={primary}>
								Primary
							</Button>
							<Button href='#' variant={secondary}>
								Secondary
							</Button>
						</div>
						<div className='bg-dark rounded p-1.5 flex flex-wrap items-center gap-1'>
							<Button href='#' variant={primaryDark}>
								Primary
							</Button>
							<Button href='#' variant={secondaryDark}>
								Secondary
							</Button>
						</div>
					</div>
				</section>
			))}

			<section className='border-t pt-2 space-y-1.5'>
				<div>
					<h2 className='text-subheading'>Kit 4 — Spread / Tertiary Layout</h2>
					<p className='text-caption opacity-60'>
						Full-width, bordered, label and arrow pushed to opposite ends. For
						standalone CTA banners, not inline links.
					</p>
				</div>

				<div className='grid md:grid-cols-2 gap-1'>
					<div className='bg-light rounded p-1.5'>
						<ButtonKit4 href='#' variant='tertiary-on-light'>
							View our work
						</ButtonKit4>
					</div>
					<div className='bg-dark rounded p-1.5'>
						<ButtonKit4 href='#' variant='tertiary-on-dark'>
							View our work
						</ButtonKit4>
					</div>
				</div>
			</section>
		</Section>
	);
}
