import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { Toaster } from "@/components/ui/toaster";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DeDup — Clean Your Phone, Keep Your Memories",
  description:
    "DeDup finds and removes duplicate photos, videos and files — entirely on your device. Your data never leaves your phone.",
  keywords: ["DeDup", "duplicate cleaner", "phone cleaner", "on-device", "privacy", "Android"],
  authors: [{ name: "Rahul Pahuja" }],
  openGraph: {
    title: "DeDup — Clean Your Phone, Keep Your Memories",
    description:
      "DeDup finds and removes duplicate photos, videos and files — entirely on your device.",
    siteName: "DeDup",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DeDup — Clean Your Phone, Keep Your Memories",
    description:
      "DeDup finds and removes duplicate photos, videos and files — entirely on your device.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} antialiased bg-[#080B14] text-[#F8FAFF]`}
      >{/* ── Google Analytics (gtag.js) — GA4 ID: G-E6B5M8JKHP ── */}
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
