/**
 * Shared layout for the Stripe Connect sample pages.
 * Reuses the Blueprint dark / amber visual language from the landing page.
 */
import Link from "next/link";
import { siteContent } from "@/content/site";
import { LogoMark } from "@/components/icons";

export default function ConnectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3 text-white">
            <LogoMark />
            <span className="text-sm font-semibold tracking-wide">
              {siteContent.brand.name}
            </span>
          </Link>
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/connect"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Connect demo
            </Link>
            <Link
              href="/connect/dashboard"
              className="text-zinc-400 transition-colors hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-4 py-1.5 text-white transition hover:border-white/30 hover:bg-white/5"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>
      <main className="relative px-6 py-12">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_40%)]" />
        <div className="relative mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
