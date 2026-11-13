import Section from '../layout/Section';

const DesignSystemHero = () => {
	return (
		<Section>
			<div className='border-b py-2 mb-2'>
				<div className='space-y-0.75'>
					<p className='text-overline'>Design System</p>
					<h1 className=''>
						Brand & <span className=''> Design</span> Tokens
					</h1>
				</div>
				<p className='text-subheading mt-1.25 lg:w-2/3 '>
					The visual foundation of your website — colors, typography, spacing,
					and components all in one place.
				</p>
			</div>
		</Section>
	);
};

export default DesignSystemHero;
