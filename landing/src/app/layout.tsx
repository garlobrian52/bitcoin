import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { siteContent } from "@/content/site";
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
  title: `${siteContent.brand.name} — ${siteContent.brand.tagline}`,
  description: siteContent.hero.subheadline,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth scroll-pt-24 antialiased md:scroll-pt-16`}
    >
      <body className="min-h-full bg-[#09090b] font-sans text-zinc-100">{children}</body>
    </html>
  );
}
