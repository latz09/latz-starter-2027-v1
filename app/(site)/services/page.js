import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { FETCH_SERVICES_PAGE_QUERY as Q } from '@/data/queries/pages/FETCH_SERVICES_PAGE_QUERY';
import PageContainer from '@/components/animations/PageContainer';
import Section from '@/components/layout/Section';

export async function generateMetadata() {
	return BPM({ slug: '/services', query: Q });
}

const Services = async () => {
	const data = await fc(Q);

	return (
		<PageContainer>
			<Section className='h-[80vh] grid place-items-center'>
				<h1>{data?.title ?? 'Services'}</h1>
			</Section>
		</PageContainer>
	);
};

export default Services;

export const revalidate = 10;
