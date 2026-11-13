'use client';

import { useState } from 'react';
import ContactForm from './ContactForm';
import { contactConfig } from '@/data/config/contact';

// Derives initial (and reset) state straight from the field config, so a
// field rename in contact.js can never leave a stale key behind here —
// that's exactly the class of bug that bit the message/description rename
// on Classic Log Homes.
const buildInitialFormData = () => {
	const initial = {};
	contactConfig.formFields.forEach((field) => {
		initial[field.name] = '';
	});
	return initial;
};

const SubmitContactForm = () => {
	const [formData, setFormData] = useState(buildInitialFormData);

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);
		setError('');
		setSuccess('');

		try {
			const response = await fetch('/api/submitContactForm', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const result = await response.json();

			if (result.success) {
				setFormData(buildInitialFormData());
				setSuccess('Message sent successfully!');
			} else {
				setError(result.message || 'Something went wrong. Try again.');
			}
		} catch (err) {
			setError('Failed to send message. Please try again.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<ContactForm
			fields={contactConfig.formFields}
			formData={formData}
			handleInputChange={handleInputChange}
			handleSubmit={handleSubmit}
			isLoading={isLoading}
			error={error}
			success={success}
		/>
	);
};

export default SubmitContactForm;