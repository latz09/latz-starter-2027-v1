'use client';

import { useState } from 'react';
import Link from 'next/link';
import ButtonPreviews from './ButtonPreviews';
import ColorPalette from './ColorPalette';
import { Typography } from './Typography';

const TABS = [
	{ key: 'buttons', label: 'Buttons', Component: ButtonPreviews },
	{ key: 'colors', label: 'Colors', Component: ColorPalette },
	{ key: 'typography', label: 'Typography', Component: Typography },
];

const DesignSystemPreview = () => {
	const [activeTab, setActiveTab] = useState('buttons');
	const ActiveComponent = TABS.find((tab) => tab.key === activeTab)?.Component;

	return (
		<div>
			<div className='flex flex-wrap justify-center gap-1 pb-2'>
				{TABS.map(({ key, label }) => (
					<button
						key={key}
						onClick={() => setActiveTab(key)}
						className={`text-button px-1.25 py-0.75 rounded transition-all duration-200 ${
							activeTab === key
								? 'bg-primary text-white'
								: 'bg-light border border-dark/20 text-dark hover:border-primary'
						}`}
					>
						{label}
					</button>
				))}
			</div>

			{activeTab === 'buttons' && (
				<p className='text-center pb-2'>
					Choose button type at{' '}
					<Link href='/design/buttons'>
						<code className='text-primary font-black underline'>/design/buttons</code>
					</Link>
				</p>
			)}

			{ActiveComponent && <ActiveComponent />}
		</div>
	);
};

export default DesignSystemPreview;