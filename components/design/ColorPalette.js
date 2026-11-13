// components/design/ColorPalette.js
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '@/tailwind.config.js';
import Section from '../layout/Section';

const fullConfig = resolveConfig(tailwindConfig);

const ColorPalette = () => {
	const colors = fullConfig.theme.colors;

	const brandColors = [
		{ name: 'Primary', var: 'primary' },
		{ name: 'Secondary', var: 'secondary' },
		{ name: 'Tertiary', var: 'tertiary' },
		{ name: 'Accent', var: 'accent' },
		{ name: 'Dark', var: 'dark' },
		{ name: 'Light', var: 'light' },
	];

	return (
		<Section className='px-1 sm:px-1.25 md:px-2.5 lg:px-5 3xl:max-w-[130rem] 3xl:mx-auto border border-dark/10 shadow-soft'>
			<div className='bg-white p-4 rounded'>
				<h2 className='mb-2'>Color Palette</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1.5'>
					{brandColors.map((color) => (
						<div
							key={color.var}
							className='group h-[16rem] overflow-hidden rounded border border-dark/10'
						>
							<div
								className='h-8 w-full group-hover:h-full transition-all duration-300'
								style={{ backgroundColor: colors[color.var] }}
							/>
							<div className='p-1 space-y-0.25'>
								<p className='font-semibold text-lg'>{color.name}</p>
								<p className='text-sm text-dark/60 uppercase'>
									{colors[color.var]}
								</p>
								<p className='text-xs font-mono text-dark/50'>bg-{color.var}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</Section>
	);
};

export default ColorPalette;
