import Link from "next/link";
import { ProductForm } from "@/components/connect/product-form";
import { connectStyles as s } from "@/components/connect/styles";

type PageProps = {
  searchParams: Promise<{ accountId?: string }>;
};

/**
 * Product management page — create products on a connected account.
 */
export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId;

  if (!accountId?.startsWith("acct_")) {
    return (
      <div className={s.page}>
        <main className={s.container}>
          <div className={s.error}>
            Missing or invalid <code>accountId</code> query parameter. Go back to
            the{" "}
            <Link href="/connect" className="underline">
              Connect dashboard
            </Link>{" "}
            and create an account first.
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className={s.page}>
      <header className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href={`/connect?accountId=${accountId}`}
            className="text-sm font-semibold text-white"
          >
            ← Dashboard
          </Link>
          <span className="text-xs uppercase tracking-widest text-zinc-500">
            Products
          </span>
        </div>
      </header>

      <main className={s.container}>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">Create products</h1>
          <p className="mt-2 text-zinc-400">
            Products are created on connected account{" "}
            <code className="text-amber-200">{accountId}</code> using the
            Stripe-Account header.
          </p>
        </div>

        <ProductForm accountId={accountId} />
      </main>
    </div>
  );
}
