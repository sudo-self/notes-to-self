// FILE: app/layout.tsx

import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: "NTS - Notes To Self",
  description:
    "Write notes, keep them private or share them with the team. Github OAuth and Turso DB serverless app",
  manifest: "/manifest.json",

  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NTS - Notes To Self",
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },

  openGraph: {
    title: "NTS - Notes To Self",
    description:
      "Write notes, keep them private or share them with the team. Github OAuth and Turso DB serverless app",
    url: "https://notes-to-self.vercel.app",
    siteName: "NTS - Notes To Self",
    images: [
      {
        url: "https://notes-to-self.vercel.app/icon-512.png",
        width: 1200,
        height: 630,
        alt: "NTS - Notes To Self App Preview",
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "NTS - Notes To Self",
    description:
      "Write notes, keep them private or share them with the team. Github OAuth and Turso DB serverless app",
    images: ["https://notes-to-self.vercel.app/icon-512.png"],
  },

  metadataBase: new URL("https://notes-to-self.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

