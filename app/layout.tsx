import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "After Hours",
  // Viewport is now a separate export in Next.js 14+ usually, or part of metadata types if supported. 
  // Should check if we should use 'viewport' export or generic metadata.
  // Actually, 'viewport' is a separate export in recent Next.js versions.
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

import { ToastProvider } from "@/components/providers/ToastProvider";
import { PostHogProvider } from "@/components/providers/PostHogProvider";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";
import DynamicMetaTheme from "@/components/DynamicMetaTheme";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <DynamicMetaTheme />
          <ToastProvider>
            <PostHogProvider>
              <AppShell>
                {children}
              </AppShell>
            </PostHogProvider>
          </ToastProvider>
        </Providers>
      </body >
    </html >
  );
}
