import Image from 'next/image';
import Link from 'next/link';
import DefaultLogo from '@/public/images/logos/business-name.png';
import WhiteLogo from '@/public/images/logos/business-name-white.png';
// import VerticalLogo from '@/public/images/logos/business-name-vertical.svg';
// import StackedLogo from '@/public/images/logos/business-name-stacked.svg';

const logos = {
	default: DefaultLogo,
	white: WhiteLogo,
	// vertical: VerticalLogo,
	// stacked: StackedLogo,
};

const Logo = ({ className, url, variant = 'default', alt = 'logo', width = 200, height = 200 }) => {
	const LogoAsset = logos[variant] || logos.default;
	const isSvgComponent = typeof LogoAsset === 'function';

	return (
		<Link href={url || '/'} className='z-[9999] block h-auto'>
			{isSvgComponent ? (
				<LogoAsset className={className} />
			) : (
				<Image
					src={LogoAsset}
					alt={alt}
					className={className}
					width={width}
					height={height}
				/>
			)}
		</Link>
	);
};

export default Logo;