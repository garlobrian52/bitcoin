import Link from "next/link";

/**
 * Stripe Connect sample — entry page.
 * Walks through onboarding, catalog, storefront, and platform subscriptions.
 */
export default function ConnectHomePage() {
  return (
    <div className="space-y-10">
      <div className="max-w-2xl">
        <p className="mb-4 inline-flex items-center rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
          Stripe Connect sample
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Onboard sellers, sell products, bill accounts
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-400">
          This demo uses Accounts v2, Account Links, Direct Charges with an
          application fee, and platform subscriptions billed to{" "}
          <code className="text-amber-200">customer_account</code>.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/connect/dashboard"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-amber-300/30 hover:bg-white/[0.05]"
        >
          <h2 className="text-lg font-semibold text-white">Merchant dashboard</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Create a connected account, complete onboarding, add products, and
            subscribe to the platform plan.
          </p>
        </Link>
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">Customer storefront</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            After you create an account, open{" "}
            <code className="text-amber-200">/connect/store/acct_...</code> to
            browse that seller&apos;s catalog.
          </p>
        </div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-sm leading-7 text-zinc-400">
        <h2 className="mb-3 text-base font-semibold text-white">Setup checklist</h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Copy <code className="text-amber-200">landing/.env.example</code> to{" "}
            <code className="text-amber-200">landing/.env.local</code> and replace
            every <code className="text-amber-200">REPLACE_ME</code> value.
          </li>
          <li>
            Install Stripe CLI and forward thin + snapshot events (see{" "}
            <code className="text-amber-200">landing/STRIPE_CONNECT.md</code>).
          </li>
          <li>
            Create a recurring Price in the Dashboard and set{" "}
            <code className="text-amber-200">STRIPE_PRICE_ID</code>.
          </li>
          <li>
            Run <code className="text-amber-200">npm run dev</code> inside{" "}
            <code className="text-amber-200">landing/</code>.
          </li>
        </ol>
      </section>
    </div>
  );
}
