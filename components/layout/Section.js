// components/layout/Section.js

/**
 * Wraps a full-width outer element (for background color, if any) around an
 * inner div that carries section-x-padding — so the background can go edge
 * to edge while the actual content stays lined up with the rest of the page.
 *
 * `as` picks which HTML tag gets rendered for the outer element. Defaults to
 * 'section', but pass whatever's semantically correct for that instance —
 * e.g. 'header' for a page's hero/intro block. React accepts a variable
 * holding a lowercase tag name as a valid element type, so <Tag> below just
 * renders as whatever string `as` resolves to.
 *
 * `py` sets vertical padding and takes a full Tailwind class string — not a
 * bare number. Tailwind only generates CSS for classes it can find written
 * out literally in your source, so building one at runtime (e.g. `py-${n}`)
 * won't work; pass the whole class ('py-8'), or two space-separated classes
 * for an asymmetric one-off ('pt-4 pb-8'). Defaults to 'py-4'.
 *
 * `bg` goes on the outer tag, `py` goes on the inner div — so any background
 * color always covers the full padded height (top and bottom), not just the
 * content sitting inside it.
 *
 * `className` is for anything else one-off: height, max-width, flex/grid
 * behavior on the content wrapper, etc.
 *
 * Examples:
 *
 *   // Default spacing (py-4), no background — most sections
 *   <Section>
 *     <p>Just content</p>
 *   </Section>
 *   → <section>
 *       <div class="section-x-padding py-4"><p>Just content</p></div>
 *     </section>
 *
 *   // Page hero — semantically a header, symmetric py-8
 *   <Section as='header' py='py-8'>
 *     <h1 className='hero-title'>Hero Title</h1>
 *   </Section>
 *   → <header>
 *       <div class="section-x-padding py-8">
 *          <h1 class="hero-title">Hero Title</h1>
 *      </div>
 *     </header>
 *
 *   // Full-bleed background band, symmetric spacing
 *   <Section bg='bg-primary' py='py-8'>
 *     <p className='text-light'>Background spans edge to edge</p>
 *   </Section>
 *   → <section class="bg-primary">
 *       <div class="section-x-padding py-8"><p class="text-light">Background spans edge to edge</p></div>
 *     </section>
 *
 *   // One-off asymmetric padding, plus an extra layout class
 *   <Section bg='bg-primary' py='pt-4 pb-8' className='h-[88svh] mx-auto'>
 *     <p>Tighter top, more room below</p>
 *   </Section>
 */

const Section = ({
	children,
	as: Tag = 'section',
	bg = '',
	py = 'py-4',
	className = '',
}) => {
	return (
		<Tag className={bg}>
			<div className={`section-x-padding ${py} ${className}`}>{children}</div>
		</Tag>
	);
};

export default Section;
