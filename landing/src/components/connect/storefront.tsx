"use client";

import { useEffect, useState } from "react";
import { connectStyles as s } from "./styles";

type Price = {
  id: string;
  unit_amount: number | null;
  currency: string;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  default_price: Price | string | null;
};

type Props = {
  accountId: string;
};

/**
 * Customer-facing storefront — lists products and starts hosted Checkout (Direct Charge).
 *
 * NOTE: This demo uses the connected account ID (acct_...) in the URL.
 * In production, use a friendly slug or your own merchant identifier instead.
 */
export function Storefront({ accountId }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/storefront/${accountId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Failed to load products");
        setProducts(data.products);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [accountId]);

  async function handleBuy(product: Product) {
    const price =
      typeof product.default_price === "object"
        ? product.default_price
        : null;

    if (!price?.unit_amount) {
      setError("Product has no price configured.");
      return;
    }

    setCheckoutLoading(product.id);
    setError(null);

    try {
      const res = await fetch(`/api/storefront/${accountId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: product.name,
          unitAmount: price.unit_amount,
          currency: price.currency,
          quantity: 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setCheckoutLoading(null);
    }
  }

  function formatPrice(price: Price | null): string {
    if (!price?.unit_amount) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: price.currency.toUpperCase(),
    }).format(price.unit_amount / 100);
  }

  if (loading) {
    return <p className="text-zinc-400">Loading products…</p>;
  }

  return (
    <div className="space-y-6">
      {error && <div className={s.error}>{error}</div>}

      {products.length === 0 ? (
        <div className={s.card}>
          <p className="text-zinc-400">
            No products yet. The merchant needs to add products from their
            dashboard.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product) => {
            const price =
              typeof product.default_price === "object"
                ? product.default_price
                : null;

            return (
              <article key={product.id} className={s.card}>
                <h3 className="text-lg font-semibold text-white">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="mt-1 text-sm text-zinc-400">
                    {product.description}
                  </p>
                )}
                <p className="mt-3 text-xl font-semibold text-amber-300">
                  {formatPrice(price)}
                </p>
                <button
                  type="button"
                  className={`${s.buttonPrimary} mt-4 w-full`}
                  onClick={() => handleBuy(product)}
                  disabled={checkoutLoading === product.id}
                >
                  {checkoutLoading === product.id ? "Redirecting…" : "Buy now"}
                </button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
