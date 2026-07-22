"use client";

/**
 * Customer storefront for a single connected account.
 *
 * URL uses the Stripe Account id for this demo. In production you should use a
 * stable public identifier (slug / store id) and map it to acct_... server-side
 * so you do not expose internal Stripe ids in customer-facing URLs.
 */
import { use, useEffect, useState } from "react";

type Product = {
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

export default function StorefrontPage({
  params,
}: {
  params: Promise<{ accountId: string }>;
}) {
  // Next.js 15+ passes `params` as a Promise in client components as well.
  const { accountId } = use(params);

  const [products, setProducts] = useState<Product[]>([]);
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
        if (!cancelled) setProducts(data.products ?? []);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
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
      // Prefer assign() over setting location.href (React Compiler immutability lint).
      window.location.assign(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-amber-200">
          Storefront
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Shop this seller
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Connected account: <code className="text-amber-200">{accountId}</code>
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          {/* Prefer a public store slug in production instead of the raw acct_ id. */}
          Demo note: replace the account id in the URL with your own store
          identifier before going to production.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {products.length === 0 && !error && (
          <p className="text-sm text-zinc-500">
            No products yet. Create some from the merchant dashboard.
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
              className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-6"
            >
              <h2 className="text-lg font-semibold text-white">{product.name}</h2>
              {product.description && (
                <p className="mt-2 flex-1 text-sm leading-6 text-zinc-400">
                  {product.description}
                </p>
              )}
              <div className="mt-6 flex items-center justify-between gap-3">
                <span className="text-amber-200">
                  {formatMoney(price?.unit_amount, price?.currency ?? "usd")}
                </span>
                <button
                  type="button"
                  onClick={() => buy(product.id)}
                  disabled={busyId === product.id}
                  className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
                >
                  {busyId === product.id ? "Redirecting…" : "Buy"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
