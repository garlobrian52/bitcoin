import Link from "next/link";
import { ConnectDashboard } from "@/components/connect/connect-dashboard";
import { connectStyles as s } from "@/components/connect/styles";

type PageProps = {
  searchParams: Promise<{ accountId?: string; subscription?: string }>;
};

/**
 * Merchant dashboard for Stripe Connect onboarding, products, and subscriptions.
 */
export default async function ConnectPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId;

  return (
    <div className={s.page}>
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-sm font-semibold text-white">
            ← Blueprint
          </Link>
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            Stripe Connect
          </span>
        </div>
      </header>

      <main className={s.container}>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">
            Connect dashboard
          </h1>
          <p className="mt-2 text-zinc-400">
            Onboard merchants, create products, and accept payments on connected
            accounts.
          </p>
          {params.subscription === "success" && (
            <div className={`${s.success} mt-4`}>
              Subscription checkout completed. Webhook handlers will update
              subscription status.
            </div>
          )}
        </div>

        <ConnectDashboard initialAccountId={accountId} />
      </main>
    </div>
  );
}
