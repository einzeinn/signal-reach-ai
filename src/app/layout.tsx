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
  title: "SignalReach AI — Intent-Based Sales Intelligence",
  description:
    "Monitor buying intent signals across LinkedIn, Reddit, and news sources. Score leads with Gemini AI and generate hyper-personalized cold emails in seconds.",
  keywords: ["sales intelligence", "intent signals", "AI outreach", "B2B sales", "Bright Data"],
  openGraph: {
    title: "SignalReach AI",
    description: "From signal to personalized email in seconds — powered by Gemini AI & Bright Data.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
