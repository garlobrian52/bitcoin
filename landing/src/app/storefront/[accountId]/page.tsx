import Link from "next/link";
import { Storefront } from "@/components/connect/storefront";
import { connectStyles as s } from "@/components/connect/styles";

type PageProps = {
  params: Promise<{ accountId: string }>;
};

/**
 * Public storefront for a connected account's customers.
 *
 * NOTE: This demo uses the Stripe account ID (acct_...) in the URL path.
 * In production, replace this with a merchant slug, subdomain, or your own ID
 * and resolve it to the Stripe account ID server-side.
 */
export default async function StorefrontPage({ params }: PageProps) {
  const { accountId } = await params;

  return (
    <div className={s.page}>
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <span className="text-sm font-semibold text-white">Store</span>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
            Powered by Blueprint
          </Link>
        </div>
      </header>

      <main className={s.container}>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">Shop</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Payments go directly to the connected account (Direct Charge with
            platform application fee).
          </p>
        </div>

        <Storefront accountId={accountId} />
      </main>
    </div>
  );
}
