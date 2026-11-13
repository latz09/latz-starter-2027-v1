import { themePreview } from '@/data/config/theme';

// Renders one row per style in data/config/theme.js → themePreview.typography,
// so /design always shows THIS client's real type scale after `npm run theme`
// (including per-client classes like Paragraph Large/Small, or a missing
// Overline). `tag` is the element; `className` applies the style (null for
// h1-h6, styled by their base rule).
export const Typography = () => {
	return (
		<div className='px-1 sm:px-1.25 md:px-2.5 lg:px-5 3xl:max-w-[130rem] 3xl:mx-auto space-y-3 m-2'>
			{themePreview.typography.map((style, i) => {
				const Tag = style.tag;
				const isLast = i === themePreview.typography.length - 1;
				return (
					<div key={`${style.label}-${i}`} className={isLast ? 'pb-2' : 'border-b border-dark/20 pb-2'}>
						<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>
							{style.label}
							{style.className ? (
								<span className='font-mono lowercase tracking-normal text-dark/40'>
									{' '}
									.{style.className}
								</span>
							) : null}
						</p>
						<Tag className={style.className || undefined}>{style.sample}</Tag>
					</div>
				);
			})}
		</div>
	);
};
