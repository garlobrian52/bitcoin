import { siteContent } from "@/content/site";

export function HowItWorks() {
  const { howItWorks } = siteContent;

  return (
    <section
      id="process"
      className="scroll-mt-24 border-t border-line bg-[linear-gradient(180deg,#f7fafb_0%,#eaf2f0_100%)] px-6 py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {howItWorks.title}
          </h2>
          <p className="mt-4 text-base leading-7 text-ink-soft sm:text-lg">
            {howItWorks.description}
          </p>
        </div>

        <ol className="mt-14 grid gap-8 md:grid-cols-3">
          {howItWorks.steps.map((step) => (
            <li key={step.number} className="border-t-2 border-accent/70 pt-6">
              <span className="font-[family-name:var(--font-display)] text-sm font-bold tracking-[0.2em] text-highlight">
                {step.number}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl font-bold text-ink">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-ink-soft sm:text-base">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
