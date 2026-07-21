import Link from "next/link";
import { siteContent } from "@/content/site";

export function Footer() {
  const { brand, footer } = siteContent;

  return (
    <footer className="border-t border-line bg-mist px-6 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-[family-name:var(--font-display)] text-base font-bold text-ink">
            {brand.name}
          </p>
          <p className="mt-1 text-sm text-ink-soft">{footer.note}</p>
        </div>
        <nav className="flex flex-wrap gap-5 text-sm font-medium text-ink-soft">
          {footer.links.map((link) => (
            <Link key={link.href + link.label} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
