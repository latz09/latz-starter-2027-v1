'use client';

import { useState, useMemo } from 'react';
import { BsImages } from 'react-icons/bs';
import SanityImage from '@/components/ui/SanityImage';
import SlideShow from './SlideShow';

export default function GalleryGrid({ images, allImages, preview = false }) {
	const [openIndex, setOpenIndex] = useState(-1);

	const lightboxImages = useMemo(
		() => (preview ? allImages : images) || [],
		[preview, allImages, images]
	);

	const slides = useMemo(
		() =>
			lightboxImages.map((item, idx) => ({
				src: item.image.asset.url,
				alt: item.image.alt || `Gallery image ${idx + 1}`,
			})),
		[lightboxImages]
	);

	if (!images || images.length === 0) {
		return (
			<div className='mt-12 text-center opacity-60'>
				No images available for this category.
			</div>
		);
	}

	const handleOpen = (clickedItem, fallbackIndex) => {
		const idx = lightboxImages.findIndex((it) => it._id === clickedItem._id);
		setOpenIndex(idx >= 0 ? idx : fallbackIndex);
	};

	const handleViewAll = () => {
		setOpenIndex(5);
	};

	return (
		<>
			<div className='mt-12 columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4'>
				{images.map((item, index) => {
					return (
						<div key={item._id} className='relative break-inside-avoid mb-4'>
							<div
								className='relative overflow-hidden rounded cursor-pointer group'
								onClick={() => handleOpen(item, index)}
							>
								<SanityImage
									image={item.image}
									alt={item.image.alt || 'Gallery image'}
									preset='gallery'
									className='w-full h-auto transition-opacity duration-200 group-hover:opacity-90'
									sizes='(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw'
								/>
								{/* Mobile icon */}
								<div className='absolute bottom-2 right-2 bg-primary p-3 rounded-full lg:hidden'>
									<BsImages className='text-light text-xl' />
								</div>
								{/* Desktop hover overlay */}
								<div className='hidden lg:flex absolute inset-0 items-center justify-center bg-primary/75 opacity-0 group-hover:opacity-100 transition-opacity'>
									<BsImages className='text-light text-4xl' />
								</div>
							</div>
						</div>
					);
				})}
			</div>

			{/* View Full Gallery Button */}
			{preview && allImages?.length > 6 && (
				<div className='mt-8 text-center'>
					<button
						onClick={handleViewAll}
						className='inline-flex items-center justify-center rounded font-semibold transition-all duration-300 bg-primary text-light hover:opacity-90 px-6 py-3'
					>
						View Full Gallery
					</button>
				</div>
			)}

			<SlideShow
				openIndex={openIndex}
				setOpenIndex={setOpenIndex}
				slides={slides}
			/>
		</>
	);
}

export { GalleryGrid };
