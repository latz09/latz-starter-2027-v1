import StickyNav from './StickyNav';
import { getNavLinks } from '@/data/config/getNavLinks';

const NavigationContainer = async () => {
	const navLinks = await getNavLinks();
	return <StickyNav navLinks={navLinks} />;
};

export default NavigationContainer;
export const revalidate = 10;