'use client';

import { useTheme } from "next-themes";
import { useEffect } from "react";

export default function DynamicMetaTheme() {
    const { theme } = useTheme();

    useEffect(() => {
        // Values from user request
        const lightTheme = '#F2F2F2';
        const darkTheme = '#000000';

        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        const color = theme === 'dark' ? darkTheme : lightTheme;

        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', color);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = color;
            document.head.appendChild(meta);
        }
    }, [theme]);

    return null;
}
