import Link from "next/link";
import { siteContent } from "@/content/site";

export function Hero() {
  const { brand, hero } = siteContent;

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(160deg,#d9e8f0_0%,#f7fafb_42%,#e8f2ef_100%)]" />
      <div className="hero-grid absolute inset-0 opacity-70" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-paper to-transparent" />
      <div className="pointer-events-none absolute -right-24 top-24 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(15,122,107,0.18),transparent_68%)]" />
      <div className="pointer-events-none absolute -left-16 bottom-10 h-[22rem] w-[22rem] rounded-full bg-[radial-gradient(circle,rgba(212,160,23,0.16),transparent_70%)]" />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end px-6 pb-16 pt-28 sm:justify-center sm:pb-24 sm:pt-32">
        <p className="animate-rise font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-tight text-ink sm:text-7xl md:text-8xl">
          {brand.name}
        </p>

        <div className="hero-rule mt-6 h-px w-24 bg-accent sm:w-32" />

        <h1 className="animate-rise-delay-1 mt-8 max-w-3xl font-[family-name:var(--font-display)] text-3xl font-bold leading-[1.1] tracking-tight text-ink sm:text-5xl">
          {hero.headline}
        </h1>

        <p className="animate-rise-delay-2 mt-5 max-w-xl text-base leading-7 text-ink-soft sm:text-lg sm:leading-8">
          {hero.support}
        </p>

        <div className="animate-rise-delay-3 mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex h-12 items-center justify-center bg-accent px-7 text-sm font-semibold text-white transition hover:bg-accent-deep"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="inline-flex h-12 items-center justify-center border border-ink/20 bg-paper/60 px-7 text-sm font-semibold text-ink backdrop-blur-sm transition hover:border-ink/40"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
