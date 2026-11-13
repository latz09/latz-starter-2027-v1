import { buildPageMetadata as BPM } from '@/utils/seo/buildPageMetadata';
import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { FETCH_CONTACT_PAGE_QUERY as Q } from '@/data/queries/pages/FETCH_CONTACT_PAGE_QUERY';
import PageContainer from '@/components/animations/PageContainer';
import Section from '@/components/layout/Section';
import SubmitContactForm from '@/components/forms/SubmitContactForm';

export async function generateMetadata() {
	return BPM({ slug: '/contact', query: Q });
}

const Contact = async () => {
	const data = await fc(Q);

	return (
		<PageContainer>
			<Section as='header'>
				<h1>{data?.title ?? 'Contact'}</h1>
			</Section>
			{/* The standing form system: config in data/config/contact.js. */}
			<Section py='pb-5 lg:pb-8.75'>
				<div className='max-w-3xl'>
					<SubmitContactForm />
				</div>
			</Section>
		</PageContainer>
	);
};

export default Contact;

export const revalidate = 10;
