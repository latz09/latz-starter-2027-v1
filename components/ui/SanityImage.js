import {
  DEFAULT_IMAGE_SIZE,
  getHotspotStyles,
  getSanityImageUrl,
  IMAGE_PRESETS,
} from '@/utils/cms/getSanityImageUrl';
import Image from 'next/image';

const SanityImage = ({ 
  image, 
  alt = '', 
  preset,
  customSize = null,
  className = '',
  fill = false,
  priority = false,
  sizes = '100vw',
  ...props 
}) => {
  if (!image?.asset) return null;

  if (preset && !IMAGE_PRESETS[preset] && process.env.NODE_ENV === 'development') {
    console.warn(`SanityImage: no IMAGE_PRESETS entry named "${preset}". Using the default size.`);
  }

  const sizeOptions = customSize || IMAGE_PRESETS[preset] || DEFAULT_IMAGE_SIZE;
  const imageUrl = getSanityImageUrl(image, sizeOptions);
  if (!imageUrl) return null;
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