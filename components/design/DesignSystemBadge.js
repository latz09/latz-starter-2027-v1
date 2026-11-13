'use client';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const DesignSystemBadge = () => {
    const pathname = usePathname();
    const router = useRouter();
    const isDesignPage = pathname === '/design';

    if (isDesignPage) {
        return (
            <button
                onClick={() => router.back()}
                className='fixed bottom-1 right-1 z-50 flex items-center gap-0.75 border border-primary bg-primary px-1.25 py-0.75 rounded text-white hover:bg-white hover:text-primary transition duration-300 text-caption'
            >
                ← go back
            </button>
        );
    }

    return (
        <Link
            href='/design'
            className='fixed bottom-1  right-1 z-50 flex items-center gap-0.75 bg-light hover:border hover:border-secondary px-1.25 py-0.75 rounded-full transition-all duration-200 group'
        >
            <span className='text-primary lg:text-2xl group-hover:text-secondary'>✦</span>
            <span className='max-w-0 text-caption overflow-hidden group-hover:max-w-xs transition-all text-primary duration-300 whitespace-nowrap'>
                design system
            </span>
        </Link>
    );
};

export default DesignSystemBadge;