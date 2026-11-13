// /emails/previewData.js
export const previewBranding = {
	name: 'CLIENT_NAME',
	logoUrl:
		'https://cdn.sanity.io/images/9yfxmlzk/production/replace-with-real-logo.png',
	colors: {
		background: '#FFFDF9',
		surface: '#F5F0E6',
		accent: '#3C084D',
		text: '#111827',
		textMuted: '#6B7280',
	},
	contactInfo: { phone: '(715) 555-0100', email: 'client@example.com' },
};

export const previewFields = [
	{ name: 'name', label: 'Name', type: 'text' },
	{ name: 'email', label: 'Email', type: 'email' },
	{ name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
	{ name: 'message', label: 'How can we help?', type: 'textarea' },
];

export const previewFormData = {
	name: 'Sarah Johnson',
	email: 'sarah@example.com',
	phoneNumber: '(715) 555-0192',
	message:
		"Hi! I'm interested in getting a quote for a new website. Could someone give me a call this week?",
};

export const previewMessaging = {
	clientNotificationEyebrow: 'New Website Inquiry',
	clientNotificationHeading: 'New Contact Form Submission',
	clientNotificationIntro:
		"You have received a new message from your website's contact form.",
	autoResponseEyebrow: 'Message Received',
	autoResponseGreeting: (name) => `Thanks for reaching out, ${name}!`,
	autoResponseBody:
		"We've received your message and will be in touch within 1-2 business days.",
	autoResponseUrgentNote:
		'If you have any urgent questions, feel free to call us directly.',
	signoffLabel: 'Best regards,',
	autoResponseClosing: 'CLIENT_NAME',
};

export const previewTimestamp = 'July 21, 2026 at 02:30:00 PM';
