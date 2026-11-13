import Link from 'next/link';
import DesignSystemHero from '@/components/design/DesignSystemHero';
import DesignSystemPreview from '@/components/design/DesignSystemPreview';

const DesignAndDevelopment = () => {
	return (
		<div className='min-h-screen'>
			<DesignSystemHero />
			<DesignSystemPreview />
			<div className='section-x-padding py-2 flex flex-wrap gap-1.5 text-button'>
				<Link href='/design/buttons' className='underline hover:text-primary'>
					Button kits →
				</Link>
				<Link href='/design/checklist' className='underline hover:text-primary'>
					Project setup checklist →
				</Link>
			</div>
		</div>
	);
};

export default DesignAndDevelopment;