import { siteContent } from "@/content/site";

export function HowItWorks() {
  const { howItWorks } = siteContent;

  return (
    <section id="how-it-works" className="border-t border-white/10 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {howItWorks.title}
          </h2>
          <p className="mt-4 text-lg leading-8 text-zinc-400">{howItWorks.description}</p>
        </div>

        <ol className="mt-14 grid gap-6 lg:grid-cols-3">
          {howItWorks.steps.map((step) => (
            <li
              key={step.number}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-6"
            >
              <span className="text-sm font-medium tracking-[0.2em] text-amber-300">
                {step.number}
              </span>
              <h3 className="mt-4 text-xl font-medium text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-400">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
