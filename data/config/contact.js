export const contactConfig = {
	branding: {
		name: 'CLIENT_NAME',
		logoUrl:
			'https://cdn.sanity.io/images/9yfxmlzk/production/................................', // Replace with actual logo
		colors: {
			background: '#FFFDF9', // page/section background behind the logo + body
			surface: '#F5F0E6', // "Submission Details" box background
			accent: '#3C084D', // top bar, eyebrow text, buttons, textarea border — customize per client
			text: '#111827',
			textMuted: '#6B7280',
		},
		contactInfo: {
			phone: '', // Replace with client's actual phone
			email: process.env.CLIENT_EMAIL, // Or hardcode if needed
		},
	},

	features: {
		// Auto-response to the person who filled out the form is a paid add-on.
		// Off by default — flip to true once the client's paid for it.
		autoResponseEmail: false,
	},

	formFields: [
		{
			name: 'name',
			label: 'Name',
			required: true,
			type: 'text',
			placeholder: 'Your name',
		},
		{
			name: 'email',
			label: 'Email',
			required: true,
			type: 'email',
			placeholder: 'you@example.com',
		},
		{
			name: 'phoneNumber',
			label: 'Phone Number',
			required: true,
			type: 'tel',
			placeholder: '(123) 456-7890',
		},
		{
			name: 'message',
			label: 'How can we help?',
			required: false,
			type: 'textarea',
			placeholder: 'Tell us about your project...',
		},
		// Add fields here as needed — supported types: text, email, tel, textarea, select, radio.
		// select/radio need an `options: [{ value, label }]` array, e.g.:
		// { name: 'projectType', label: 'Project Type', required: false, type: 'radio', options: [
		//   { value: 'new_site', label: 'New website' },
		//   { value: 'redesign', label: 'Redesign' },
		// ] },
	],

	messaging: {
		clientEmailSubject: (name) => `New Website Inquiry from ${name}`,
		autoResponseSubject: (name) => `${name}, We Received Your Message`,

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
		autoResponseClosing: 'CLIENT_NAME', // Replace with client name, e.g. 'Jeff<br/>CLIENT_NAME'
	},
};
