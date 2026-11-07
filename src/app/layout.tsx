import type { Metadata, Viewport } from "next";
import Script from "next/script";
import localFont from "next/font/local";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SiteEvents } from "@/components/analytics/site-events";

// Self-hosted (see ./fonts/README.md) so the build never needs to reach Google Fonts.
const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-display",
  weight: "300 700",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-body",
  weight: "100 900",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dedup.space"),
  title: "DeDup: Duplicate Photo & File Cleaner",
  description:
    "DeDup finds duplicate photos and videos on Android and iPhone, and files on Android. It scans on your device and shows what it would remove before deleting.",
  keywords: [
    "DeDup",
    "duplicate photo cleaner",
    "duplicate file finder",
    "free up storage",
    "near-duplicate photos",
    "on-device",
    "Android",
    "iPhone",
    "iOS",
  ],
  authors: [{ name: "Rahul Pahuja" }],
  // No site-wide canonical: each page sets its own. A canonical of "/" here was inherited by
  // every page without one (the blog included), pointing them all at the homepage.
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    title: "DeDup: Duplicate Photo & File Cleaner",
    description:
      "DeDup finds duplicate photos and videos on Android and iPhone, and files on Android. It scans on your device and shows what it would remove before deleting.",
    siteName: "DeDup",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeDup: Duplicate Photo & File Cleaner",
    description:
      "DeDup finds duplicate photos and videos on Android and iPhone, and files on Android. It scans on your device and shows what it would remove before deleting.",
    creator: "@therahulpahuja",
  },
};

export const viewport: Viewport = {
  themeColor: "#060D1F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-night text-white`}
      >
        {/* ── Google Analytics (gtag.js) — GA4 ID: G-E6B5M8JKHP ── */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-E6B5M8JKHP"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-E6B5M8JKHP');
          `}
        </Script>

        <SiteEvents />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
