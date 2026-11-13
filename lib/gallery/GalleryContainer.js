import { fetchContent } from '@/utils/cms/fetchContent';
import { FETCH_GALLERY_QUERY as QUERY } from '@/data/queries/sections/FETCH_GALLERY_QUERY';
import { GalleryGrid } from './GalleryGrid';

const GalleryContainer = async ({ filter, preview = true }) => {
	const images = await fetchContent(QUERY, { filter });
	const displayImages = preview ? images?.slice(0, 6) : images;

	return (
		<section className='py-section-sm md:py-section px-container max-w-container mx-auto'>
			<GalleryGrid
				images={displayImages}
				allImages={images}
				preview={preview}
			/>
		</section>
	);
};

export default GalleryContainer;
export const revalidate = 10;