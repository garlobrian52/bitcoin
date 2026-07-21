import Link from "next/link";
import { siteContent } from "@/content/site";

export function Cta() {
  const { cta } = siteContent;

  return (
    <section id="cta" className="px-6 py-24">
      <div className="mx-auto max-w-5xl rounded-3xl border border-amber-300/20 bg-gradient-to-br from-amber-300/10 via-white/[0.03] to-transparent px-8 py-16 text-center sm:px-16">
        <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          {cta.title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-300">
          {cta.description}
        </p>
        <Link
          href={cta.button.href}
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-amber-400 px-8 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
        >
          {cta.button.label}
        </Link>
      </div>
    </section>
  );
}
