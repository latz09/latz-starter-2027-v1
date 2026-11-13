// components/design/SpacingScale.js
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

const SpacingScale = () => {
	const spacing = fullConfig.theme.spacing;

	const allSpacing = Object.entries(spacing).map(([key, value]) => ({
		key,
		value,
	}));

	return (
		<div className='max-w-5xl mx-auto px-2 py-4'>
			<h2 className='mb-2'>Spacing Scale</h2>
			<div className='space-y-1'>
				{allSpacing.map((space) => (
					<div
						key={space.key}
						className='border border-dark/20 rounded p-1'
					>
						<div className='flex items-center justify-between mb-0.5'>
							<div>
								<p className='font-semibold'>Space {space.key}</p>
								<p className='text-[0.875rem] text-dark/60'>{space.value}</p>
								<p className='text-[0.75rem] font-mono text-dark/50'>
									p-{space.key} or m-{space.key}
								</p>
							</div>
						</div>
						<div className='bg-dark/10 h-[1.5rem] relative'>
							<div
								className='bg-primary h-full'
								style={{ width: space.value }}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SpacingScale;