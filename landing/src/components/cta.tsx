import Link from "next/link";
import { siteContent } from "@/content/site";

export function Cta() {
  const { cta } = siteContent;

  return (
    <section id="start" className="scroll-mt-24 border-t border-line px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="relative overflow-hidden bg-ink px-8 py-14 text-paper sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="relative max-w-2xl">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight sm:text-4xl">
              {cta.title}
            </h2>
            <p className="mt-4 text-base leading-7 text-white/75 sm:text-lg">
              {cta.description}
            </p>
            <Link
              href={cta.button.href}
              className="mt-8 inline-flex h-12 items-center justify-center bg-highlight px-7 text-sm font-semibold text-ink transition hover:brightness-110"
            >
              {cta.button.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
