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
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg" alt="Teams" className="w-5 h-5" />
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
