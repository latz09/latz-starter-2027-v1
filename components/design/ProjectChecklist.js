// data/set-up/ProjectChecklist.js
import Link from 'next/link';

// Per-project setup steps pulled from what this starter template actually
// requires — update this list if the template's config surface changes.
const CHECKLIST = [
	{ task: 'Set the color palette', location: 'tailwind.config.js' },
		{ task: 'Update typography', location: 'globals.css' },
	{
		task: 'Confirm heading + accent colors map right for this client',
		location: 'app/globals.css (--heading-color, --accent-color)',
	},
	{
		task: 'Choose button type',
		location: '/design/buttons',
		href: '/design/buttons',
	},
	{
		task: 'Set nav height and hero spacing for this design',
		location: 'app/globals.css (--nav-h, --hero-pt)',
	},
	{
		task: 'Update routes that need a light-on-dark nav',
		location: 'data/config/navigation.js (DARK_NAV_ROUTES)',
	},
	{ task: 'Choose fonts and update page metadata', location: 'app/layout.js' },
	{ task: 'Replace the logo', location: '/public/images/business-name' },
	{
		task: 'Fill in contact form config — branding, colors, fields, messaging',
		location: 'data/config/contact.js',
	},
	{ task: 'Test the contact form end to end', location: null },
	{
		task: 'Set footer business name, drop "Powered by" if decided',
		location: 'components/layout/footer/Footer.js, FooterBottomBar.js',
	},
	{
		task: 'Set site URL — must match in both places',
		location:
			'Sanity → SEO Settings → Site URL, and NEXT_PUBLIC_SITE_URL in .env',
	},
];

const ProjectChecklist = () => {
	return (
		<div className='section-x-padding py-4'>
			<h2 className='opacity-30 mb-2 '>New Project Setup</h2>
			<div className='rounded-lg border border-dark/10 shadow-soft overflow-hidden'>
				<table className='w-full text-left border-collapse'>
					<thead>
						<tr className='bg-dark/[0.03] border-b border-dark/10'>
							<th className='text-caption uppercase tracking-wide text-dark/50 px-1.5 py-1'>
								Task
							</th>
							<th className='text-caption uppercase tracking-wide text-dark/50 px-1.5 py-1'>
								Location
							</th>
						</tr>
					</thead>
					<tbody>
						{CHECKLIST.map(({ task, location, href }, index) => (
							<tr
								key={index}
								className={
									index !== CHECKLIST.length - 1
										? 'border-b border-dark/10'
										: ''
								}
							>
								<td className='text-paragraph px-1.5 py-1.5 align-top'>
									{task}
								</td>
								<td className='px-1.5 py-1 align-center'>
									{location &&
										(href ? (
											<Link href={href}>
												<code className='text-primary font-black underline'>
													{location}
												</code>
											</Link>
										) : (
											<code className='text-dark/70'>{location}</code>
										))}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default ProjectChecklist;
