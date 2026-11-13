export const Typography = () => {
	return (
		<div className='px-1 sm:px-1.25 md:px-2.5 lg:px-5 3xl:max-w-[130rem] 3xl:mx-auto space-y-3 m-2'>
			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>Hero Title</p>
				<h1 className='hero-title'>Hero Title</h1>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>H1</p>
				<h1>Heading 1</h1>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>H2</p>
				<h2>Heading 2</h2>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>H3</p>
				<h3>Heading 3</h3>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>H4</p>
				<h4>Heading 4</h4>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>H5</p>
				<h5>Heading 5</h5>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>H6</p>
				<h6>Heading 6</h6>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>Overline</p>
				<p className='text-overline'>OVERLINE TEXT</p>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>Subheading</p>
				<p className='text-subheading'>
					This is a subheading for additional context
				</p>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>Paragraph</p>
				<p className='text-paragraph'>
					This is body text for longer paragraphs and general content. It is
					designed for readability and comfortable reading at various screen
					sizes.
				</p>
			</div>

			<div className='border-b border-dark/20 pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>Caption</p>
				<p className='text-caption'>This is caption text for small details</p>
			</div>

			<div className='pb-2'>
				<p className='text-[0.75rem] font-semibold uppercase tracking-[0.05em] text-dark/50 mb-1'>Button Text</p>
				<p className='text-button'>BUTTON TEXT</p>
			</div>
		</div>
	);
}