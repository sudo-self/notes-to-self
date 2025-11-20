// FILE: app/layout.tsx

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
  title: "NTS - Notes To Self",
  description: "Write notes, keep them private or share them with the team. Github OAuth and Turso DB serverless app",
  manifest: "/manifest.json",
  themeColor: "#7c3aed",
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
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
  },
  openGraph: {
    title: "NTS - Notes To Self",
    description: "Write notes, keep them private or share them with the team. Github OAuth and Turso DB serverless app",
    url: "https://notes-to-self.vercel.app",
    siteName: "NTS - Notes To Self",
    images: [
      {
        url: "https://private-user-images.githubusercontent.com/119916323/516634148-3a0441bc-e412-4c0e-b3e7-dd2fd67feea1.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM2MjQwOTUsIm5iZiI6MTc2MzYyMzc5NSwicGF0aCI6Ii8xMTk5MTYzMjMvNTE2NjM0MTQ4LTNhMDQ0MWJjLWU0MTItNGMwZS1iM2U3LWRkMmZkNjdmZWVhMS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTEyMFQwNzI5NTVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00NzVmMTcwYjI2YTgwOGMwYzYzMGI3NjNiNmNiNjUyYWJlMmIwOWIwYWI2ZjExYmE3NWJjODdiMTg3NGU5MmE1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.hadvVyS4DQh-05llaVm4xqiCrQ2rqNh6RkDwvMRDCzo",
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
    description: "Write notes, keep them private or share them with the team. Github OAuth and Turso DB serverless app",
    images: ["https://private-user-images.githubusercontent.com/119916323/516634148-3a0441bc-e412-4c0e-b3e7-dd2fd67feea1.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NjM2MjQwOTUsIm5iZiI6MTc2MzYyMzc5NSwicGF0aCI6Ii8xMTk5MTYzMjMvNTE2NjM0MTQ4LTNhMDQ0MWJjLWU0MTItNGMwZS1iM2U3LWRkMmZkNjdmZWVhMS5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjUxMTIwJTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI1MTEyMFQwNzI5NTVaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT00NzVmMTcwYjI2YTgwOGMwYzYzMGI3NjNiNmNiNjUyYWJlMmIwOWIwYWI2ZjExYmE3NWJjODdiMTg3NGU5MmE1JlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.hadvVyS4DQh-05llaVm4xqiCrQ2rqNh6RkDwvMRDCzo"],
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
