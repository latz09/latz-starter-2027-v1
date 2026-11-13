// pages/api/submitContactForm.js
// POST target for components/forms/SubmitContactForm.js.
// Validates required fields, emails the client via Resend, and stores the
// submission as a `contactForm` document in Sanity.
//
// Per-client config lives in data/config/contact.js, not here.
// Env: RESEND_API_KEY, CLIENT_EMAIL, SANITY_API_TOKEN (editor role).

import { Resend } from 'resend';
import { sanityClient } from '@/utils/cms/sanityConnection';
import { fetchSeoSettings } from '@/utils/cms/fetchSeoSettings';
import { contactConfig } from '@/data/config/contact';
import ClientNotificationEmail from '@/emails/ClientNotificationEmail';
import AutoResponseEmail from '@/emails/AutoResponseEmail';

// Must match the `from` domain verified in Resend.
const FROM_DOMAIN = 'mail.latzwebdesign.com';

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { formFields, messaging, features } = contactConfig;

	const missingFields = formFields.filter((f) => f.required && !req.body?.[f.name]);
	if (missingFields.length > 0) {
		return res.status(400).json({
			success: false,
			message: `Missing required fields: ${missingFields.map((f) => f.label).join(', ')}`,
		});
	}

	const formData = {};
	formFields.forEach((field) => {
		formData[field.name] = req.body[field.name] || 'Not provided';
	});

	// Live name/phone/email/logo from seoSettings, so the client edits them in
	// the Studio. contactConfig.branding is only the fallback.
	const seo = await fetchSeoSettings();
	const branding = {
		...contactConfig.branding,
		name: seo?.siteName ?? contactConfig.branding.name,
		logoUrl: seo?.emailLogoUrl ?? contactConfig.branding.logoUrl,
		contactInfo: {
			...contactConfig.branding.contactInfo,
			phone: seo?.phone ?? contactConfig.branding.contactInfo.phone,
			email: seo?.email ?? contactConfig.branding.contactInfo.email,
		},
	};

	const timestamp = new Intl.DateTimeFormat('en-US', {
		timeZone: 'America/Chicago', // adjust per client if they're outside Central time
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: true,
	}).format(new Date());

	const emailProps = { branding, fields: formFields, formData, messaging, timestamp };

	// ── Email ───────────────────────────────────────────────────────────────
	let emailPromise = Promise.resolve();
	if (process.env.RESEND_API_KEY && process.env.CLIENT_EMAIL) {
		const resend = new Resend(process.env.RESEND_API_KEY);

		// Always notify the business owner. Reply-To is the lead's address, so
		// hitting Reply goes straight to the person who submitted.
		const emailsToSend = [
			resend.emails.send({
				from: `${branding.name} Website <forms@${FROM_DOMAIN}>`,
				to: process.env.CLIENT_EMAIL,
				replyTo: formData.email,
				subject: messaging.clientEmailSubject(formData.name),
				react: <ClientNotificationEmail {...emailProps} />,
			}),
		];

		// Auto-response to the lead is a paid add-on: only when the flag is on.
		if (features?.autoResponseEmail) {
			emailsToSend.push(
				resend.emails.send({
					from: `${branding.name} <forms@${FROM_DOMAIN}>`,
					to: formData.email,
					replyTo: branding.contactInfo.email,
					subject: messaging.autoResponseSubject(formData.name),
					react: <AutoResponseEmail {...emailProps} />,
				}),
			);
		}

		emailPromise = Promise.all(emailsToSend).catch((error) => {
			console.error('Error sending emails:', error);
		});
	} else {
		console.warn('Contact form: RESEND_API_KEY or CLIENT_EMAIL not set, no email sent.');
	}

	// ── Store in Sanity ─────────────────────────────────────────────────────
	let sanityResult = null;
	if (sanityClient && process.env.SANITY_API_TOKEN) {
		try {
			sanityResult = await sanityClient
				.withConfig({ token: process.env.SANITY_API_TOKEN })
				.create({
					_type: 'contactForm',
					...formData,
					submittedAt: new Date().toISOString(),
				});
		} catch (sanityError) {
			console.error('Error storing data in Sanity:', sanityError);
		}
	} else {
		console.warn('Contact form: Sanity or SANITY_API_TOKEN not set, submission not stored.');
	}

	await emailPromise;

	return res.status(200).json({
		success: true,
		message: sanityResult
			? 'Form submitted successfully'
			: 'Form submitted successfully, but encountered an error storing data.',
		data: sanityResult ? { _id: sanityResult._id } : null,
	});
}
