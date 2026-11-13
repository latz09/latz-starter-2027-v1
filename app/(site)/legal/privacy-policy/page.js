
import Section from '@/components/layout/Section';
import { fetchSeoSettings } from '@/utils/cms/fetchSeoSettings';


const effectiveDate = 'January 1, 2025';
const businessLocation = 'United States'; // e.g., "United States", "Wisconsin", etc.

export default async function PrivacyPolicy() {
	const seo = await fetchSeoSettings();
	const businessName = seo?.siteName ?? 'Company Name';
	const contactEmail = seo?.email ?? 'client@email.com';
	return (
		<Section className='flex justify-center '>
			<article className='max-w-5xl px-1.5 lg:px-md py-sm'>
				{/* HEADER */}
				<header className='mb-md'>
					<h4>{businessName} &ndash; Privacy&nbsp;Policy</h4>
					<p className='mt-0.5 text-caption opacity-60'>
						Effective Date:&nbsp;{effectiveDate}
					</p>
					<p className='mt-1 text-paragraph-sm'>
						{`This Privacy Policy explains how ${businessName} ("we," "us," or "our") collects, uses, discloses, and safeguards your information when you visit our website or use our services.`}
					</p>
					<p className='mt-0.5 text-caption italic opacity-70'>
						{`NOTE: For readability, "site" refers to all pages, applications, and services controlled by ${businessName}.`}
					</p>
				</header>

				{/* 1. INFORMATION WE COLLECT */}
				<section className='mb-sm'>
					<h6>1&nbsp;&ndash; Information We Collect</h6>
					<ul className='list-disc list-inside space-y-0.5 mt-0.75 text-paragraph-sm'>
						<li>
							<strong>Information you provide&nbsp;directly.</strong> Examples:
							name, email, phone, postal address, order details, support
							requests, or any other data you voluntarily submit.
						</li>
						<li>
							<strong>Device &amp; usage information.</strong> IP address,
							browser type, referring URLs, pages viewed, and the date/time of
							each visit, collected automatically via cookies or similar
							technologies.
						</li>
						<li>
							<strong>Payment information (if applicable).</strong> Processed by
							our payment partner&nbsp;&mdash; we do <em>not</em> store full
							card numbers.
						</li>
					</ul>
				</section>

				{/* 2. LEGAL BASIS (GDPR) */}
				<section className='mb-sm'>
					<h6>2&nbsp;&ndash; Legal Bases for Processing&nbsp;(GDPR)</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						If you reside in the European Economic Area, we process your
						personal data under the following legal bases:
					</p>
					<ul className='list-disc list-inside space-y-0.5 mt-0.75 text-paragraph-sm'>
						<li>
							<strong>Contract:</strong> To perform a contract with you or
							provide requested services.
						</li>
						<li>
							<strong>Consent:</strong> When you have given us explicit
							permission (you may withdraw at any time).
						</li>
						<li>
							<strong>Legitimate Interest:</strong> For security, analytics,
							marketing, or improving our services, provided those interests are
							not overridden by your rights.
						</li>
						<li>
							<strong>Legal Obligation:</strong> To comply with applicable laws.
						</li>
					</ul>
				</section>

				{/* 3. HOW WE USE YOUR INFORMATION */}
				<section className='mb-sm'>
					<h6>3&nbsp;&ndash; How We Use Information</h6>
					<ul className='list-disc list-inside space-y-0.5 mt-0.75 text-paragraph-sm'>
						<li>Provide and maintain the site and any contractual services.</li>
						<li>Respond to inquiries, comments, and requests.</li>
						<li>
							Send administrative information, product updates, or promotional
							messages{' '}
							<span className='text-caption italic'>
								(you can opt out any time)
							</span>
							.
						</li>
						<li>
							Analyze usage to improve functionality, security, and user
							experience.
						</li>
						<li>Comply with legal obligations and enforce our terms.</li>
					</ul>
				</section>

				{/* 4. COOKIES & TRACKING */}
				<section className='mb-sm'>
					<h6>4&nbsp;&ndash; Cookies &amp; Similar Technologies</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						We and our service providers use cookies, pixels, and local storage
						to recognize your browser, improve site performance, and measure
						marketing effectiveness. You can disable cookies in your browser,
						but some features may not function properly.
					</p>
				</section>

				{/* 5. DISCLOSURES */}
				<section className='mb-sm'>
					<h6>5&nbsp;&ndash; Sharing of Information</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						We do not sell or rent personal data. We share it only with:
					</p>
					<ul className='list-disc list-inside space-y-0.5 mt-0.75 text-paragraph-sm'>
						<li>
							<strong>Service providers</strong> who perform functions on our
							behalf (hosting, email delivery, payment processing, analytics)
							and who are bound by confidentiality agreements.
						</li>
						<li>
							<strong>Authorities or other parties</strong> when required by
							law, court order, or to protect our rights, property, or safety.
						</li>
						<li>
							<strong>Successors</strong> in the event of a merger, acquisition,
							or other business transfer, subject to the terms of this Policy.
						</li>
					</ul>
				</section>

				{/* 6. DATA RETENTION */}
				<section className='mb-sm'>
					<h6>6&nbsp;&ndash; Data Retention</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						We keep personal data only as long as necessary for the purposes
						described above, unless a longer period is required by law.
					</p>
				</section>

				{/* 7. INTERNATIONAL TRANSFERS */}
				<section className='mb-sm'>
					<h6>7&nbsp;&ndash; International Transfers</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						We are headquartered in {businessLocation} and may transfer data to
						service providers located in other countries. Where we do so, we
						rely on approved legal mechanisms such as Standard Contractual
						Clauses or adequacy decisions.
					</p>
				</section>

				{/* 8. YOUR RIGHTS */}
				<section className='mb-sm'>
					<h6>8&nbsp;&ndash; Your Privacy Rights</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						Depending on your jurisdiction, you may have the right to:
					</p>
					<ul className='list-disc list-inside space-y-0.5 mt-0.75 text-paragraph-sm'>
						<li>Access, correct, or delete your personal information.</li>
						<li>Object to or restrict certain processing.</li>
						<li>Receive a portable copy of your data.</li>
						<li>
							Opt out of sale or sharing of personal information (California
							residents).
						</li>
						<li>
							Lodge a complaint with your local data protection authority.
						</li>
					</ul>
					<p className='mt-0.75 text-paragraph-sm'>
						To exercise any of these rights, contact us at&nbsp;
						<a
							href={`mailto:${contactEmail}`}
							className='font-semibold underline text-blue-light hover:opacity-80'
						>
							{contactEmail}
						</a>
						.
					</p>
				</section>

				{/* 9. CHILDREN'S PRIVACY */}
				<section className='mb-sm'>
					<h6>{`9\u00A0\u2013 Children's Privacy`}</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						Our site is not directed to children under 13 (or other age as
						required by local law). We do not knowingly collect personal
						information from children. If you believe we have inadvertently done
						so, please contact us and we will delete it promptly.
					</p>
				</section>

				{/* 10. SECURITY */}
				<section className='mb-sm'>
					<h6>10&nbsp;&ndash; Security</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						We implement reasonable technical and organizational measures to
						protect your personal information. However, no method of
						transmission over the internet is 100&#37; secure.
					</p>
				</section>

				{/* 11. CHANGES */}
				<section className='mb-sm'>
					<h6>11&nbsp;&ndash; Changes to This Policy</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						{`We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated "Effective Date." Continued use of the site after such changes constitutes acceptance.`}
					</p>
				</section>

				{/* 12. CONTACT */}
				<section>
					<h6>12&nbsp;&ndash; Contact Us</h6>
					<p className='mt-0.75 text-paragraph-sm'>
						Questions or concerns? Email us at&nbsp;
						<a
							href={`mailto:${contactEmail}`}
							className='font-semibold underline text-blue-light hover:opacity-80'
						>
							{contactEmail}
						</a>
						.
					</p>
				</section>
			</article>
		</Section>
	);
}