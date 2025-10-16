import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OnchainProviders } from '@/components/onchain-providers';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PredictHub - Your Gateway to the Future of Prediction Markets",
  description: "Discover, analyze, and trade prediction markets across multiple platforms. Real-time data, smart insights, and seamless trading in one place. Join the future of decentralized prediction markets.",
  keywords: ["prediction markets", "polymarket", "polkamarkets", "omen", "zeitgeist", "trading", "crypto", "defi", "blockchain"],
  authors: [{ name: "PredictHub Team" }],
  creator: "PredictHub",
  publisher: "PredictHub",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://predicthub.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "PredictHub - Your Gateway to the Future of Prediction Markets",
    description: "Discover, analyze, and trade prediction markets across multiple platforms. Real-time data, smart insights, and seamless trading in one place.",
    url: 'https://predicthub.com',
    siteName: 'PredictHub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'PredictHub - Prediction Markets Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "PredictHub - Your Gateway to the Future of Prediction Markets",
    description: "Discover, analyze, and trade prediction markets across multiple platforms. Real-time data, smart insights, and seamless trading in one place.",
    images: ['/twitter-image.png'],
    creator: '@predicthub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OnchainProviders>
          {children}
        </OnchainProviders>
      </body>
    </html>
  );
}
