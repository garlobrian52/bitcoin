import Link from "next/link";
import { siteContent } from "@/content/site";

export function Hero() {
  const { brand, hero, preview } = siteContent;
  const previewInitial = preview.handle.replace(/^@/, "").trim().charAt(0).toUpperCase() || "?";

  return (
    <section className="relative overflow-hidden px-6 pb-16 pt-10 md:min-h-[calc(100svh-4rem)] md:pb-20 md:pt-14">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,transparent_40%,rgba(20,32,28,0.08)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-[var(--accent)]/20 blur-3xl animate-pulse-soft"
        aria-hidden
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
        <div>
          <p className="animate-rise font-display text-5xl font-semibold tracking-tight text-[var(--ink)] sm:text-6xl md:text-7xl">
            {brand.name}
          </p>
          <p className="animate-rise-delay-1 mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-deep)]">
            {brand.tagline}
          </p>

          <h1 className="animate-rise-delay-1 mt-8 max-w-xl font-display text-3xl font-medium leading-tight text-[var(--ink)] sm:text-4xl">
            {hero.headline}
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-lg text-base leading-7 text-[var(--ink-soft)] sm:text-lg">
            {hero.subheadline}
          </p>

          <div className="animate-rise-delay-2 mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-7 text-sm font-semibold text-white transition hover:bg-[var(--accent-deep)]"
            >
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white/40 px-7 text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--ink)]/30 hover:bg-white/70"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>
        </div>

        <div className="animate-rise-delay-2 flex justify-center lg:justify-end">
          <div className="animate-float relative w-full max-w-[320px]">
            <div
              className="absolute -inset-6 rounded-[2rem] bg-[var(--accent)]/15 blur-2xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[linear-gradient(160deg,#1a2a24_0%,#0f1a16_100%)] p-5 shadow-[0_30px_80px_rgba(20,32,28,0.28)]">
              <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-white/20" />
              <div className="flex flex-col items-center text-center text-[var(--paper)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent)] font-display text-2xl font-semibold text-white">
                  {previewInitial}
                </div>
                <p className="mt-4 font-display text-xl font-semibold">{preview.handle}</p>
                <p className="mt-1 text-sm text-white/65">{preview.bio}</p>
              </div>
              <ul className="mt-6 space-y-3">
                {preview.links.map(({ label }) => (
                  <li key={label}>
                    <span className="block rounded-xl bg-white/95 px-4 py-3 text-center text-sm font-semibold text-[var(--ink)]">
                      {label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
