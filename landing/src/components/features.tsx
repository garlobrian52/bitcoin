import { siteContent } from "@/content/site";
import { FeatureIcon } from "@/components/icons";

export function Features() {
  const { features } = siteContent;

  return (
    <section id="features" className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {features.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-400">{features.description}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2">
          {features.items.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-300/30 hover:bg-white/[0.05]"
            >
              <div className="mb-4 inline-flex rounded-xl bg-amber-300/10 p-3 text-amber-300">
                <FeatureIcon name={feature.icon} />
              </div>
              <h3 className="text-xl font-medium text-white">{feature.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
