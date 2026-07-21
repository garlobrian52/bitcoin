import Link from "next/link";
import { siteContent } from "@/content/site";

export function Cta() {
  const { cta } = siteContent;

  return (
    <section id="cta" className="border-t border-[var(--line)] px-6 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-5xl">
          {cta.title}
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--ink-soft)]">
          {cta.description}
        </p>
        <Link
          href={cta.button.href}
          className="mt-10 inline-flex h-12 items-center justify-center rounded-full bg-[var(--ink)] px-8 text-sm font-semibold text-[var(--paper)] transition hover:bg-[var(--accent-deep)]"
        >
          {cta.button.label}
        </Link>
      </div>
    </section>
  );
}
