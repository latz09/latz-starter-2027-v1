import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { FETCH_HOME_PAGE_QUERY as Q } from '@/data/queries/pages/FETCH_HOME_PAGE_QUERY';
import PageContainer from '@/components/animations/PageContainer';
import Section from '@/components/layout/Section';

export async function generateMetadata() {
	return BPM({ slug: '/', query: Q });
}

const Home = async () => {
	const data = await fc(Q);

	return (
		<PageContainer>
			<Section
				as='header'
				className='grid gap-1 place-items-center text-center'
			>
				<h1>{data?.title ?? 'Home'}</h1>
				{process.env.NODE_ENV === 'development' && (
					<a href='/start-here' className='underline'>
						Start here
					</a>
				)}
			</Section>
		</PageContainer>
	);
};

export default Home;

export const revalidate = 10;
