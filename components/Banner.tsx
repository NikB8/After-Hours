'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

type BannerProps = {
    message: string;
    type?: 'info' | 'warning' | 'success' | 'error';
};

export default function Banner({ message, type = 'info' }: BannerProps) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const colors = {
        info: 'bg-blue-600',
        warning: 'bg-yellow-500',
        success: 'bg-green-600',
        error: 'bg-red-600',
    };

    return (
        <div className={`${colors[type]} text-white px-4 py-3 shadow-sm relative`}>
            <div className="container mx-auto flex justify-between items-center">
                <p className="text-sm font-medium">{message}</p>
                <button
                    onClick={() => setVisible(false)}
                    className="ml-4 flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
}
