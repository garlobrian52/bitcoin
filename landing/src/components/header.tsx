import Link from "next/link";
import { siteContent } from "@/content/site";

export function Header() {
  const { brand, nav } = siteContent;

  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center border border-ink/20 bg-paper/70 font-[family-name:var(--font-display)] text-sm font-bold tracking-wide text-ink backdrop-blur-sm transition group-hover:border-accent group-hover:text-accent">
            {brand.mark}
          </span>
          <span className="font-[family-name:var(--font-display)] text-lg font-bold tracking-tight text-ink">
            {brand.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
