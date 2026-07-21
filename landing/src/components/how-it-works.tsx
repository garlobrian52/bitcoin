import { siteContent } from "@/content/site";

export function HowItWorks() {
  const { howItWorks } = siteContent;

  return (
    <section id="how-it-works" className="border-t border-[var(--line)] px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--ink)] sm:text-4xl">
            {howItWorks.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--ink-soft)]">
            {howItWorks.description}
          </p>
        </div>

        <ol className="mt-14 grid gap-10 md:grid-cols-3">
          {howItWorks.steps.map((step) => (
            <li key={step.number} className="relative">
              <p className="font-display text-5xl font-semibold text-[var(--accent)]/35">
                {step.number}
              </p>
              <h3 className="mt-3 font-display text-xl font-medium text-[var(--ink)]">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--ink-soft)]">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
