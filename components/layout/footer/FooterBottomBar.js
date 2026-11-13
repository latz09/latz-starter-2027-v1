import Link from 'next/link';
import Section from '@/components/layout/Section';

const currentYear = new Date().getFullYear();

// Always-included legal/credit row — every project needs Privacy Policy
// and Accessibility, no exceptions. "Powered by" is NOT universal (Premier
// Federal Logistics shipped without it), so it's an opt-out per project,
// not something to assume.
const FooterBottomBar = ({
	businessName = 'Your Business Name',
	email,
	phone,
	showPoweredBy = true,
}) => {
	return (
		<Section
			as='div'
			py='pt-2 pb-1.25'
			bg=''
			className='flex flex-col sm:flex-row items-center justify-between gap-1 text-caption border-t'
		>
			<p className="text-caption">{`© ${currentYear} by ${businessName}`}</p>
			{showPoweredBy && (
				<a
					href='https://www.latzwebdesign.com'
					target='_blank'
					rel='noopener noreferrer'
					className='text-caption'
				>
					Powered by LatzWebDesign
				</a>
			)}
			<div className='flex items-center gap-1.5'>
				<Link href='/legal/privacy-policy'>Privacy Policy</Link>
				<Link href='/legal/accessibility'>Accessibility</Link>
			</div>
		</Section>
	);
};

export default FooterBottomBar;
