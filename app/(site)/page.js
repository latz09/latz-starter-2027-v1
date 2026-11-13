import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { FETCH_HOME_PAGE_QUERY as Q } from '@/data/queries/pages/FETCH_HOME_PAGE_QUERY';

import PageContainer from '@/components/animations/PageContainer';
import ProjectChecklist from '@/components/design/ProjectChecklist';

export async function generateMetadata() {
	return await BPM({ slug: '/', query: Q });
}

export default async function Home() {
	const data = await fc(Q);

	return (
		<PageContainer>
			<div className='min-h-screen text'>
				<ProjectChecklist />
			</div>
		</PageContainer>
	);
}

export const revalidate = 10;