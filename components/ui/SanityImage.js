import { getHotspotStyles, getSanityImageUrl, IMAGE_PRESETS } from '@/utils/cms/getSanityImageUrl';
import Image from 'next/image';

const SanityImage = ({ 
  image, 
  alt = '', 
  preset = 'fullWidth',
  customSize = null,
  className = '',
  fill = false,
  priority = false,
  sizes = '100vw',
  ...props 
}) => {
  if (!image?.asset) return null;

  const sizeOptions = customSize || IMAGE_PRESETS[preset] || IMAGE_PRESETS.fullWidth;
  const imageUrl = getSanityImageUrl(image, sizeOptions);
  const hotspotStyles = getHotspotStyles(image);

  if (fill) {
    return (
      <Image
        src={imageUrl}
        alt={alt}
        fill
        sizes={sizes}
        className={`object-cover ${className}`}
        style={hotspotStyles}
        priority={priority}
        {...props}
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt={alt}
      width={sizeOptions.width}
      height={sizeOptions.height}
      sizes={sizes}
      className={`object-cover ${className}`}
      style={hotspotStyles}
      priority={priority}
      {...props}
    />
  );
};

export default SanityImage;