import Link from "next/link";
import { siteContent } from "@/content/site";
import { LogoMark } from "@/components/icons";

export function Footer() {
  const { brand, footer } = siteContent;

  return (
    <footer className="border-t border-[var(--line)] px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-[var(--ink)]">
          <LogoMark className="h-7 w-7" />
          <div>
            <p className="font-display text-sm font-semibold">{brand.name}</p>
            <p className="text-xs text-[var(--muted)]">{footer.copyright}</p>
          </div>
        </div>
        <nav className="flex gap-6 text-sm text-[var(--muted)]" aria-label="Footer">
          {footer.links.map((link) => (
            <Link key={link.label} href={link.href} className="hover:text-[var(--ink)]">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
