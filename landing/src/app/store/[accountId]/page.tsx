"use client";

/**
 * Per-connected-account storefront.
 *
 * NOTE: This demo uses the Stripe account id (acct_...) in the URL for simplicity.
 * In production you should use a stable public slug / store id that you map to the
 * connected account id in your database — never expose internal ids if you can avoid it.
 */
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  default_price?:
    | string
    | {
        id: string;
        unit_amount: number | null;
        currency: string;
      }
    | null;
};

function formatMoney(unitAmount: number | null | undefined, currency: string) {
  if (unitAmount == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(unitAmount / 100);
}

export default function StorefrontPage() {
  const params = useParams<{ accountId: string }>();
  // Demo URL param — replace with your own public store identifier later.
  const accountId = params.accountId;

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/connect/products?accountId=${encodeURIComponent(accountId)}`,
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load products");
        if (!cancelled) setProducts(data.products || []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load storefront");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [accountId]);

  async function buy(productId: string) {
    setBusyId(productId);
    setError(null);
    try {
      const res = await fetch("/api/connect/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, productId, quantity: 1 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
              Connected storefront
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Shop</h1>
            <p className="mt-1 font-mono text-xs text-zinc-500">{accountId}</p>
          </div>
          <Link
            href={`/connect?accountId=${accountId}`}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Seller dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="max-w-2xl text-sm text-zinc-400">
          Products are listed from the connected account using the Stripe-Account header.
          Checkout creates a Direct Charge with an application fee for the platform.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {products.length === 0 && !error && (
            <p className="text-sm text-zinc-500">
              No products yet. Create some from the seller dashboard.
            </p>
          )}
          {products.map((product) => {
            const price =
              product.default_price && typeof product.default_price !== "string"
                ? product.default_price
                : null;
            return (
              <article
                key={product.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
              >
                <h2 className="text-lg font-medium text-white">{product.name}</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {product.description || "No description"}
                </p>
                <div className="mt-6 flex items-center justify-between gap-4">
                  <p className="text-xl font-semibold text-amber-200">
                    {formatMoney(price?.unit_amount, price?.currency || "usd")}
                  </p>
                  <button
                    type="button"
                    disabled={busyId === product.id}
                    onClick={() => buy(product.id)}
                    className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
                  >
                    {busyId === product.id ? "Redirecting…" : "Buy"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}
