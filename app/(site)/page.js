import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { FETCH_HOME_PAGE_QUERY as Q } from '@/data/queries/pages/FETCH_HOME_PAGE_QUERY';
import PageContainer from '@/components/animations/PageContainer';
import Section from '@/components/layout/Section';
import ProjectChecklist from '@/components/design/ProjectChecklist';

export async function generateMetadata() {
	return BPM({ slug: '/', query: Q });
}

const Home = async () => {
	const data = await fc(Q);

	return (
		<PageContainer>
			<Section as='header' className='grid place-items-center text-center'>
				<h1>{data?.title ?? 'Home'}</h1>
			</Section>
			{/* Starter-only: per-project setup list. Remove once the build starts. */}
			<ProjectChecklist />
		</PageContainer>
	);
};

export default Home;

export const revalidate = 10;
