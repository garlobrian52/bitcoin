import Link from "next/link";
import { siteContent } from "@/content/site";
import { LogoMark } from "@/components/icons";

export function Header() {
  const { brand, hero, nav } = siteContent;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4 px-6 py-4 md:h-16 md:flex-nowrap md:justify-between md:py-0">
        <Link href="/" className="flex items-center gap-3 text-white">
          <LogoMark />
          <div>
            <span className="text-sm font-semibold tracking-wide">{brand.name}</span>
            <span className="sr-only"> home</span>
          </div>
        </Link>

        <nav
          className="order-3 flex w-full items-center justify-between gap-4 text-sm md:order-2 md:w-auto md:justify-center md:gap-8"
          aria-label="Main"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-zinc-400 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={hero.primaryCta.href}
          className="order-2 rounded-full bg-amber-400 px-4 py-2 text-sm font-medium text-zinc-950 transition hover:bg-amber-300 md:order-3"
        >
          {hero.primaryCta.label}
        </Link>
      </div>
    </header>
  );
}
