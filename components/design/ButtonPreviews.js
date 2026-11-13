import ButtonLink from '../ui/ButtonLink';

const LIGHT_BUTTONS = [
	{ variant: 'primary-on-light', label: 'Primary on Light' },
	{ variant: 'secondary-on-light', label: 'Secondary on Light' },
	{ variant: 'tertiary-on-light', label: 'Tertiary on Light' },
];

const DARK_BUTTONS = [
	{ variant: 'primary-on-dark', label: 'Primary on Dark' },
	{ variant: 'secondary-on-dark', label: 'Secondary on Dark' },
	{ variant: 'tertiary-on-dark', label: 'Tertiary on Dark' },
];

const ButtonPreviews = () => {
	return (
		<div className='max-w-5xl mx-auto px-2 py-3 space-y-2'>
			{/* Light background group */}
			<div className='rounded-lg border border-dark/10 shadow-soft overflow-hidden'>
				<p className='text-caption uppercase tracking-wide text-dark/50 px-2 pt-1.5'>
					On Light Background
				</p>
				<div className='flex flex-wrap gap-1 justify-center px-2 py-2'>
					{LIGHT_BUTTONS.map(({ variant, label }) => (
						<ButtonLink key={variant} variant={variant} href='#'>
							{label}
						</ButtonLink>
					))}
				</div>
			</div>

			{/* Dark background group */}
			<div className='rounded-lg bg-dark overflow-hidden'>
				<p className='text-caption uppercase tracking-wide text-light/50 px-2 pt-1.5'>
					On Dark Background
				</p>
				<div className='flex flex-wrap gap-1 justify-center px-2 py-2'>
					{DARK_BUTTONS.map(({ variant, label }) => (
						<ButtonLink key={variant} variant={variant} href='#'>
							{label}
						</ButtonLink>
					))}
				</div>
			</div>
		</div>
	);
};

export default ButtonPreviews;