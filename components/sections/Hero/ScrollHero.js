import Image from 'next/image';
import AnimatedBackgroundImage from '@/components/animations/AnimatedBackgroundImage';
import ButtonLink from '@/components/ui/ButtonLink';

/**
 * Starter template for primary landing hero
 *
 * Props:
 * - image: Background image URL
 * - logo: Optional logo image URL
 * - heading: Main hero heading text
 * - subheading: Optional subheading text
 * - primaryCTA: Primary CTA button config { text, href, external }
 * - secondaryCTA: Secondary CTA button config { text, href, external }
 * - height: Hero height in vh units (default: 85)
 * - overlayOpacity: Overlay opacity 0-1 (default: 0.65)
 * - overlayColor: Overlay color - 'dark' or 'light' (default: 'dark')
 */
const ScrollHero = ({
	image,
	logo,
	heading = 'Main Headline',
	subheading,
	primaryCTA = 'Get Started',
	secondaryCTA = 'Learn More',
	primaryCTAHref = '/',
	secondaryCTAHref = '/',
	height = 85,
	overlayOpacity = 0.65,
	overlayColor = 'dark',
}) => {
	// // Fallback CTAs for quick setup
	// const primaryButton = {
	// 	text: 'Get Started',
	// 	href: '/contact',
	// 	external: false,
	// 	...primaryCTA,
	// };

	// const secondaryButton = secondaryCTA
	// 	? {
	// 			text: 'Learn More',
	// 			href: '/about',
	// 			external: false,
	// 			...secondaryCTA,
	// 	  }
	// 	: null;

	// Text color based on overlay
	const textColor = overlayColor === 'light' ? 'text-dark' : 'text-light';
	const overlayBg = overlayColor === 'light' ? 'bg-light' : 'bg-dark';

	return (
		<section
			className='relative w-full overflow-hidden'
			style={{ height: `${height}vh` }}
			aria-label='Hero section'
		>
			{/* Background Image Container */}
			<div className='absolute inset-0 w-full h-full'>
				{image ? (
					<AnimatedBackgroundImage
						imageUrl={image}
						backgroundPosition='center'
						largeScreenAnimation={{ backgroundPositionY: ['20%', '50%'] }}
						smallScreenAnimation={{ backgroundPositionX: ['0%', '25%'] }}
						largeScreenDuration={15}
						smallScreenDuration={10}
						reverseLarge={true}
						reverseSmall={false}
						playOnce={true}
					/>
				) : (
					// Fallback gradient background
					<div className='w-full h-full bg-gradient-to-br from-primary to-secondary' />
				)}

				{/* Overlay */}
				<div
					className={`absolute inset-0 ${overlayBg} transition-opacity duration-300`}
					style={{ opacity: overlayOpacity }}
				/>
			</div>

			{/* Content Container */}
			<div className='relative z-10 flex items-center h-full px-4 sm:px-6 lg:px-8'>
				<div className='w-full max-w-7xl mx-auto'>
					<div className='max-w-4xl text-center sm:text-left'>
						{/* Optional Logo */}
						{logo && (
							<div className='mb-6 flex justify-center sm:justify-start'>
								<Image
									src={logo}
									alt='Company logo'
									width={200}
									height={80}
									className='h-16 w-auto object-contain'
								/>
							</div>
						)}

						{/* Heading */}
						<h1 className={`heading-1 ${textColor} mb-4 lg:mb-6`}>{heading}</h1>

						{/* Optional Subheading */}
						{subheading && (
							<p
								className={`text-lg sm:text-xl lg:text-2xl ${textColor}/90 mb-8 max-w-2xl font-body`}
							>
								{subheading}
							</p>
						)}

						{/* CTA Buttons */}
						{(primaryCTA || secondaryButton) && (
							<div className='flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center sm:justify-start items-center sm:items-start'>
								{primaryCTA && (
									<ButtonLink
										href={primaryCTAHref}
										variant='primary'
										size='xl'
										font='heading'
									
										className='w-full sm:w-auto'
									>
									{primaryCTA}
									</ButtonLink>
								)}

								{secondaryCTA && (
									<ButtonLink
										href={secondaryCTAHref}
										variant='tertiary'
										size='xl'
										font='body'
										external={secondaryCTA.external}
										className='w-full sm:w-auto'
									>
										{secondaryCTA}
									</ButtonLink>
								)}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Optional scroll indicator */}
			<div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce'>
				<div
					className={`w-6 h-10 border-2 ${textColor}/50 rounded-full flex justify-center`}
				>
					<div className={`w-1 h-3 ${textColor}/70 rounded-full mt-2`}></div>
				</div>
			</div>
		</section>
	);
};

export default ScrollHero;
