import Link from "next/link";
import { siteContent } from "@/content/site";
import { LogoMark } from "@/components/icons";

export function Footer() {
  const { brand, footer } = siteContent;

  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-white">
          <LogoMark className="h-7 w-7" />
          <span className="text-sm font-medium">{brand.name}</span>
        </div>

        <nav className="flex flex-wrap gap-6" aria-label="Footer">
          {footer.links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-zinc-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-sm text-zinc-500">{footer.copyright}</p>
      </div>
    </footer>
  );
}
