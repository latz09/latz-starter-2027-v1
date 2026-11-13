// app/(site)/design/checklist/page.js
// The per-project setup checklist. Lives under /design (noindexed by
// app/(site)/design/layout.js, excluded from the sitemap) instead of on the
// home page, because its items — Resend, CORS, inviting the client, SEO
// settings — are usually still open while the site is being built. `npm run
// check` flags this page as a launch blocker. Delete this route at launch.
import ProjectChecklist from '@/components/design/ProjectChecklist';

export default function ChecklistPage() {
	return <ProjectChecklist />;
}
