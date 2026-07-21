import { siteContent } from "@/content/site";
import { FeatureIcon } from "@/components/icons";

export function Features() {
  const { features } = siteContent;

  return (
    <section id="features" className="border-t border-[var(--line)] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            {features.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--ink-soft)]">{features.description}</p>
        </div>

        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {features.items.map((feature) => (
            <article key={feature.title} className="max-w-md">
              <div className="mb-4 inline-flex text-[var(--accent-deep)]">
                <FeatureIcon name={feature.icon} className="h-7 w-7" />
              </div>
              <h3 className="font-display text-2xl font-medium text-[var(--ink)]">
                {feature.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
