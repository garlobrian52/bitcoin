import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { siteContent } from "@/content/site";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const body = Manrope({
  variable: "--font-body",
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
      className={`${display.variable} ${body.variable} h-full scroll-smooth scroll-pt-24 antialiased md:scroll-pt-20`}
    >
      <body className="min-h-full font-sans text-[var(--ink)]">{children}</body>
    </html>
  );
}
