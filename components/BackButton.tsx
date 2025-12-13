'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show on home page
    if (pathname === '/') return null;

    return (
        <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 z-40 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:bg-gray-100 transition text-sm font-medium text-gray-700 flex items-center gap-2"
        >
            <span>←</span> Back
        </button>
    );
}
