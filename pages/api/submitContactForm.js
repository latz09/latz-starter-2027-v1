// /pages/api/submitContactForm.js
import { Resend } from 'resend';
import { sanityClient } from '@/utils/cms/sanityConnection';
import { fetchSeoSettings } from '@/utils/cms/fetchSeoSettings';
import { contactConfig } from '@/data/config/contact';
import ClientNotificationEmail from '@/emails/ClientNotificationEmail';
import AutoResponseEmail from '@/emails/AutoResponseEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
	if (req.method !== 'POST') {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	// Live name/phone/email from the same Sanity doc the rest of the site
	// uses. contactConfig's own values are the fallback if seoSettings
	// hasn't been filled out yet.
	const seo = await fetchSeoSettings();
	const branding = {
		...contactConfig.branding,
		name: seo?.siteName ?? contactConfig.branding.name,
		contactInfo: {
			...contactConfig.branding.contactInfo,
			phone: seo?.phone ?? contactConfig.branding.contactInfo.phone,
			email: seo?.email ?? contactConfig.branding.contactInfo.email,
		},
	};

	const requiredFields = contactConfig.formFields.filter((f) => f.required);
	const missingFields = requiredFields.filter((f) => !req.body[f.name]);

	if (missingFields.length > 0) {
		return res.status(400).json({
			success: false,
			message: `Missing required fields: ${missingFields.map((f) => f.label).join(', ')}`,
		});
	}

	const formData = {};
	contactConfig.formFields.forEach((field) => {
		formData[field.name] = req.body[field.name] || 'Not provided';
	});

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

	// Always notify the business owner. Reply-To is the lead's own address,
	// so hitting "Reply" in their inbox goes straight to the person who submitted.
	const emailsToSend = [
		resend.emails.send({
			from: `${branding.name} Website <forms@mail.latzwebdesign.com>`,
			to: process.env.CLIENT_EMAIL,
			replyTo: formData.email,
			subject: contactConfig.messaging.clientEmailSubject(formData.name),
			react: (
				<ClientNotificationEmail
					branding={branding}
					fields={contactConfig.formFields}
					formData={formData}
					messaging={contactConfig.messaging}
					timestamp={timestamp}
				/>
			),
		}),
	];

	// Auto-response to the lead is a paid add-on — only send if the client's paid for it.
	if (contactConfig.features?.autoResponseEmail) {
		emailsToSend.push(
			resend.emails.send({
				from: `${branding.name} <forms@mail.latzwebdesign.com>`,
				to: formData.email,
				replyTo: branding.contactInfo.email,
				subject: contactConfig.messaging.autoResponseSubject(formData.name),
				react: (
					<AutoResponseEmail
						branding={branding}
						fields={contactConfig.formFields}
						formData={formData}
						messaging={contactConfig.messaging}
						timestamp={timestamp}
					/>
				),
			}),
		);
	}

	const emailPromise = Promise.all(emailsToSend).catch((error) => {
		console.error('Error sending emails:', error);
	});

	let sanityResult = null;
	try {
		sanityResult = await sanityClient.create({
			_type: 'contactForm', // Make sure this matches your Sanity schema
			...formData,
			sentAt: new Date().toISOString(),
		});
	} catch (sanityError) {
		console.error('Error storing data in Sanity:', sanityError);
	}

	await emailPromise;

	return res.status(200).json({
		success: true,
		message: sanityResult
			? 'Form submitted successfully'
			: 'Form submitted successfully, but encountered an error storing data.',
		data: sanityResult,
	});
}
