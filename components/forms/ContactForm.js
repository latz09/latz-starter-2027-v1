// components/forms/ContactForm.js
// Pure presentational renderer. Loops `fields` (from contactConfig.formFields)
// and renders the right input per field.type. Adding or removing a field is
// a data/config/contact.js change only, never a JSX change here.
//
// Starter styling is deliberately plain. Restyle per client against the
// actual design, keeping the structure (grid, success/reset button) intact.

const baseInputClasses =
	'w-full px-1 py-0.75 border border-dark/20 rounded bg-white text-paragraph focus:outline-none focus:border-secondary transition-all duration-300';

// Field types that span both columns at lg+: a textarea looks cramped at
// half width, and a radio group's option count rarely fits one column.
const FULL_WIDTH_TYPES = ['textarea', 'radio'];

const renderField = (field, formData, handleInputChange) => {
	const value = formData[field.name] ?? '';

	switch (field.type) {
		case 'textarea':
			return (
				<textarea
					id={field.name}
					name={field.name}
					value={value}
					onChange={handleInputChange}
					required={field.required}
					placeholder={field.placeholder}
					rows={field.rows || 5}
					className={`${baseInputClasses} resize-none`}
				/>
			);

		case 'select':
			return (
				<select
					id={field.name}
					name={field.name}
					value={value}
					onChange={handleInputChange}
					required={field.required}
					className={baseInputClasses}
				>
					<option value=''>
						{field.placeholder || `Select ${field.label.toLowerCase()}`}
					</option>
					{field.options?.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			);

		case 'radio':
			return (
				<div className='flex flex-wrap gap-0.75'>
					{field.options?.map((option) => {
						const isSelected = value === option.value;
						return (
							<label
								key={option.value}
								className={`flex items-center gap-0.5 px-1 py-0.5 border rounded text-caption cursor-pointer transition-colors duration-200 ${
									isSelected
										? 'border-secondary bg-secondary/10'
										: 'border-dark/20 hover:border-dark/40'
								}`}
							>
								<input
									type='radio'
									name={field.name}
									value={option.value}
									checked={isSelected}
									onChange={handleInputChange}
									required={field.required}
									className='accent-secondary'
								/>
								{option.label}
							</label>
						);
					})}
				</div>
			);

		default:
			// text, email, tel, and anything else a plain <input type="..."> handles
			return (
				<input
					type={field.type}
					id={field.name}
					name={field.name}
					value={value}
					onChange={handleInputChange}
					required={field.required}
					placeholder={field.placeholder}
					className={baseInputClasses}
				/>
			);
	}
};

const ContactForm = ({
	fields,
	formData,
	handleInputChange,
	handleSubmit,
	handleReset,
	isLoading,
	error,
	success,
}) => {
	return (
		<form onSubmit={handleSubmit} className='w-full'>
			<div
				className={`grid lg:grid-cols-2 gap-1.5 mb-2 transition-opacity duration-300 ${
					success ? 'opacity-75' : ''
				}`}
			>
				{fields.map((field) => (
					<div
						key={field.name}
						className={FULL_WIDTH_TYPES.includes(field.type) ? 'lg:col-span-2' : ''}
					>
						<label
							htmlFor={field.name}
							className='text-caption font-semibold block mb-0.5'
						>
							{field.label}
							{field.required && '*'}
						</label>
						{renderField(field, formData, handleInputChange)}
					</div>
				))}
			</div>

			{/*
			  After a successful send, this button becomes the status message AND
			  the reset control. It MUST switch to type="button" in that state: the
			  fields are empty after reset, so a submit button would be blocked by
			  the browser's required-field validation before handleReset ever ran.
			*/}
			<button
				type={success ? 'button' : 'submit'}
				onClick={success ? handleReset : undefined}
				disabled={isLoading}
				className={`group w-full text-button py-0.75 rounded border border-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
					success
						? 'bg-white text-primary'
						: 'bg-primary text-white hover:bg-white hover:text-primary'
				}`}
			>
				{isLoading ? (
					'Sending...'
				) : success ? (
					<>
						<span className='group-hover:hidden'>Message sent successfully</span>
						<span className='hidden group-hover:inline'>Send another message?</span>
					</>
				) : (
					'Send Message'
				)}
			</button>

			{error && (
				<p
					role='alert'
					className='mt-1 p-1 rounded border border-dark/20 text-caption text-dark/70 bg-white'
				>
					{error}
				</p>
			)}
		</form>
	);
};

export default ContactForm;
