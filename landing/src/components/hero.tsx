import Link from "next/link";
import { siteContent } from "@/content/site";

export function Hero() {
  const { hero } = siteContent;

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.18),transparent_45%)]" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-6 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
          {hero.eyebrow}
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-6xl sm:leading-[1.05]">
          {hero.headline}
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
          {hero.subheadline}
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={hero.primaryCta.href}
            className="inline-flex h-12 min-w-40 items-center justify-center rounded-full bg-amber-400 px-6 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            {hero.primaryCta.label}
          </Link>
          <Link
            href={hero.secondaryCta.href}
            className="inline-flex h-12 min-w-40 items-center justify-center rounded-full border border-white/15 px-6 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
          >
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
