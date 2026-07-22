"use client";

import { useState } from "react";
import Link from "next/link";
import { connectStyles as s } from "./styles";

type Props = {
  accountId: string;
};

/**
 * Form to create a product on a connected account via the Stripe-Account header.
 */
export function ProductForm({ accountId }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceDollars, setPriceDollars] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setCreatedProductId(null);

    const dollars = parseFloat(priceDollars);
    if (isNaN(dollars) || dollars < 0.5) {
      setError("Price must be at least $0.50.");
      setLoading(false);
      return;
    }

    const priceInCents = Math.round(dollars * 100);

    try {
      const res = await fetch("/api/connect/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          name,
          description,
          priceInCents,
          currency: "usd",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create product");

      setCreatedProductId(data.product.id);
      setName("");
      setDescription("");
      setPriceDollars("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {error && <div className={s.error}>{error}</div>}
      {createdProductId && (
        <div className={s.success}>
          Product created: <code>{createdProductId}</code>
        </div>
      )}

      <form onSubmit={handleSubmit} className={`${s.card} space-y-4`}>
        <div>
          <label className={s.label} htmlFor="name">
            Product name
          </label>
          <input
            id="name"
            className={s.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="T-shirt"
            required
          />
        </div>
        <div>
          <label className={s.label} htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className={`${s.input} min-h-20 resize-y`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A comfortable cotton t-shirt"
          />
        </div>
        <div>
          <label className={s.label} htmlFor="price">
            Price (USD)
          </label>
          <input
            id="price"
            type="number"
            step="0.01"
            min="0.50"
            className={s.input}
            value={priceDollars}
            onChange={(e) => setPriceDollars(e.target.value)}
            placeholder="19.99"
            required
          />
        </div>
        <button type="submit" className={s.buttonPrimary} disabled={loading}>
          {loading ? "Creating…" : "Create product"}
        </button>
      </form>

      <Link href={`/storefront/${accountId}`} className={s.buttonSecondary}>
        View storefront →
      </Link>
    </div>
  );
}
