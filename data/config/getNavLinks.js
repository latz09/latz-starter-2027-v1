import { fetchContent as fc } from '@/utils/cms/fetchContent';
import { FETCH_NAVIGATION_QUERY as Q } from '@/data/queries/navigation/FETCH_NAVIGATION_QUERY';
import { USE_CMS, PLACEHOLDER_NAV_LINKS } from './navigation';

// Single source of truth for nav links. Only ever imported by Server
// Components (NavigationContainer, Footer) — never by MobileNavbar or
// DesktopNavbar, since importing fetchContent here pulls in next/headers,
// which breaks if it reaches a 'use client' module's import graph.
export const getNavLinks = async () => {
	if (!USE_CMS) return PLACEHOLDER_NAV_LINKS;

	const data = await fc(Q);
	return data?.navLinks?.length ? data.navLinks : PLACEHOLDER_NAV_LINKS;
};