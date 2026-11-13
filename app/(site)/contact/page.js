import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { FETCH_CONTACT_PAGE_QUERY as Q } from '@/data/queries/pages/FETCH_CONTACT_PAGE_QUERY';
import PageContainer from '@/components/animations/PageContainer';

export async function generateMetadata() {
	return BPM({ slug: '/contact', query: Q });
}

const Contact = async () => {
	const data = await fc(Q);
	return (
        <PageContainer>
		<div className='h-[80vh] grid place-items-center'>
			<div>{data?.title}</div>
		</div></PageContainer>
	);
};

export default Contact;

export const revalidate = 10;
