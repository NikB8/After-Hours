'use client';

import { Share2, Link as LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';

export default function ShareButtons({ eventId, eventTitle, userId }: { eventId: string, eventTitle: string, userId?: string }) {
    const [copied, setCopied] = useState(false);

    const getShareUrl = () => {
        // Use window.location.origin to get the base URL
        let url = `${window.location.origin}/events/invite/${eventId}`;
        if (userId) {
            url += `?ref=${userId}`;
        }
        return url;
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(getShareUrl());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy', err);
        }
    };

    const handleWhatsApp = () => {
        const text = `Join me for ${eventTitle}!`;
        const url = getShareUrl();
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    };

    const handleTeams = () => {
        const text = `Join me for ${eventTitle}!`;
        const url = getShareUrl();
        // Microsoft Teams Share Endpoint
        window.open(`https://teams.microsoft.com/share?href=${encodeURIComponent(url)}&msg=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleWhatsApp}
                className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition"
                title="Share on WhatsApp"
            >
                <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" className="w-5 h-5" />
            </button>
            <button
                onClick={handleTeams}
                className="p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition"
                title="Share on Teams"
            >
                {/* Simple Teams Icon SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23 4H17V3C17 1.34315 15.6569 0 14 0H4C2.34315 0 1 1.34315 1 3V17C1 18.6569 2.34315 20 4 20H8V21C8 22.6569 9.34315 24 11 24H21C22.6569 24 24 22.6569 24 21V4ZM10 18H4C3.44772 18 3 17.5523 3 17V3C3 2.44772 3.44772 2 4 2H14C14.5523 2 15 2.44772 15 3V11H11C10.4477 11 10 11.4477 10 12V18ZM22 21C22 21.5523 21.5523 22 21 22H11C10.4477 22 10 21.5523 10 21V13H15V6H21C21.5523 6 22 6.44772 22 7V21Z" />
                </svg>
            </button>
            <button
                onClick={handleCopy}
                className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center justify-center min-w-[36px]"
                title="Copy Link"
            >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <LinkIcon className="w-5 h-5" />}
            </button>
        </div>
    );
}
