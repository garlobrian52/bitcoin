"use client";

/**
 * Seller dashboard for the Stripe Connect sample.
 *
 * Flows covered here:
 *  1. Create a V2 connected Account
 *  2. Onboard via Account Links + live status from the Accounts API
 *  3. Create products on the connected account
 *  4. Subscribe the connected account to the platform plan + Billing Portal
 */
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useCallback, useEffect, useMemo, useState } from "react";

type AccountStatus = {
  accountId: string;
  displayName?: string;
  contactEmail?: string;
  cardPaymentsStatus: string;
  requirementsStatus: string;
  readyToProcessPayments: boolean;
  onboardingComplete: boolean;
};

type StoredUser = {
  userId: string;
  stripeAccountId: string;
  displayName: string;
  contactEmail: string;
  subscriptionStatus: string;
  subscriptionId?: string;
};

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

function ConnectDashboardInner() {
  const searchParams = useSearchParams();
  const accountIdFromQuery = searchParams.get("accountId")?.trim() || "";

  const [userId, setUserId] = useState("demo-seller-1");
  const [displayName, setDisplayName] = useState("Blueprint Demo Store");
  const [contactEmail, setContactEmail] = useState("seller@example.com");
  // Local override after create / store hydrate; query wins until then (onboarding return).
  const [localAccountId, setLocalAccountId] = useState("");
  const accountId = localAccountId || accountIdFromQuery;
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [productName, setProductName] = useState("Starter widget");
  const [productDescription, setProductDescription] = useState(
    "A sample product sold by this connected account.",
  );
  const [productPrice, setProductPrice] = useState("1999");
  const [productCurrency, setProductCurrency] = useState("usd");

  const storefrontPath = useMemo(
    () => (accountId ? `/store/${accountId}` : null),
    [accountId],
  );

  const loadStoredUser = useCallback(async (id: string) => {
    const res = await fetch(`/api/connect/accounts?userId=${encodeURIComponent(id)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load user mapping");
    setStoredUser(data.user);
    if (data.user?.stripeAccountId) {
      setLocalAccountId(data.user.stripeAccountId);
    }
    return data.user as StoredUser | null;
  }, []);

  const refreshStatus = useCallback(async (id: string) => {
    const res = await fetch(
      `/api/connect/account-status?accountId=${encodeURIComponent(id)}`,
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load account status");
    setStatus(data);
    return data as AccountStatus;
  }, []);

  const refreshProducts = useCallback(async (id: string) => {
    const res = await fetch(
      `/api/connect/products?accountId=${encodeURIComponent(id)}`,
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to list products");
    setProducts(data.products || []);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await loadStoredUser(userId);
        const id = accountId || user?.stripeAccountId;
        if (!id || cancelled) return;
        await refreshStatus(id);
        await refreshProducts(id);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load Connect state");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, accountId, loadStoredUser, refreshStatus, refreshProducts]);

  async function withBusy(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function createAccount(e: FormEvent) {
    e.preventDefault();
    await withBusy(async () => {
      const res = await fetch("/api/connect/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, displayName, contactEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create account");
      setLocalAccountId(data.accountId);
      setStoredUser(data.user);
      setMessage(
        data.reused
          ? `Reusing existing connected account ${data.accountId}`
          : `Created connected account ${data.accountId}`,
      );
      await refreshStatus(data.accountId);
    });
  }

  async function startOnboarding() {
    if (!accountId) {
      setError("Create a connected account first.");
      return;
    }
    await withBusy(async () => {
      const res = await fetch("/api/connect/account-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create Account Link");
      window.location.assign(data.url);
    });
  }

  async function createProduct(e: FormEvent) {
    e.preventDefault();
    if (!accountId) {
      setError("Create and onboard a connected account first.");
      return;
    }
    await withBusy(async () => {
      const res = await fetch("/api/connect/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId,
          name: productName,
          description: productDescription,
          priceInCents: Number(productPrice),
          currency: productCurrency,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create product");
      setMessage(`Created product ${data.product.name} (${data.product.id})`);
      await refreshProducts(accountId);
    });
  }

  async function subscribeToPlatform() {
    if (!accountId) {
      setError("Create a connected account first.");
      return;
    }
    await withBusy(async () => {
      const res = await fetch("/api/connect/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not start subscription Checkout");
      window.location.assign(data.url);
    });
  }

  async function openBillingPortal() {
    if (!accountId) {
      setError("Create a connected account first.");
      return;
    }
    await withBusy(async () => {
      const res = await fetch("/api/connect/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not open Billing Portal");
      window.location.assign(data.url);
    });
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">
              Stripe Connect sample
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">Seller dashboard</h1>
          </div>
          <Link href="/" className="text-sm text-zinc-400 hover:text-white">
            ← Back to Blueprint
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        {(message || error) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-red-400/30 bg-red-500/10 text-red-100"
                : "border-emerald-400/30 bg-emerald-500/10 text-emerald-100"
            }`}
          >
            {error || message}
          </div>
        )}

        {/* 1. Create connected account */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium text-white">1. Create connected account</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Creates a Stripe V2 Account and stores a mapping from your local user id to{" "}
            <code className="text-amber-200">acct_...</code>. No top-level{" "}
            <code className="text-zinc-300">type</code> is passed.
          </p>
          <form onSubmit={createAccount} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-zinc-400">Local user id</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-amber-300/50"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Display name</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-amber-300/50"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-400">Contact email</span>
              <input
                type="email"
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-amber-300/50"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                required
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy}
                className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
              >
                Create connected account
              </button>
            </div>
          </form>
          {accountId && (
            <p className="mt-4 text-sm text-zinc-300">
              Connected account:{" "}
              <code className="rounded bg-white/5 px-1.5 py-0.5 text-amber-200">
                {accountId}
              </code>
            </p>
          )}
        </section>

        {/* 2. Onboarding status */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium text-white">2. Onboard to collect payments</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Status is always loaded live from the Accounts API (not from our database).
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <StatusCard
              label="Card payments"
              value={status?.cardPaymentsStatus ?? "—"}
              ok={status?.readyToProcessPayments}
            />
            <StatusCard
              label="Requirements"
              value={status?.requirementsStatus ?? "—"}
              ok={status?.onboardingComplete}
            />
            <StatusCard
              label="Ready to process payments"
              value={status ? (status.readyToProcessPayments ? "yes" : "no") : "—"}
              ok={status?.readyToProcessPayments}
            />
            <StatusCard
              label="Onboarding complete"
              value={status ? (status.onboardingComplete ? "yes" : "no") : "—"}
              ok={status?.onboardingComplete}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !accountId}
              onClick={startOnboarding}
              className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              Onboard to collect payments
            </button>
            <button
              type="button"
              disabled={busy || !accountId}
              onClick={() =>
                withBusy(async () => {
                  await refreshStatus(accountId);
                  setMessage("Refreshed onboarding status from Stripe.");
                })
              }
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-50"
            >
              Refresh status
            </button>
          </div>
        </section>

        {/* 3. Products */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium text-white">3. Create products</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Products are created on the connected account via the{" "}
            <code className="text-zinc-300">Stripe-Account</code> header.
          </p>

          <form onSubmit={createProduct} className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-400">Name</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-amber-300/50"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-400">Description</span>
              <textarea
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-amber-300/50"
                rows={2}
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Price (cents)</span>
              <input
                type="number"
                min={50}
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-amber-300/50"
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Currency</span>
              <input
                className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 text-white outline-none focus:border-amber-300/50"
                value={productCurrency}
                onChange={(e) => setProductCurrency(e.target.value)}
                required
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={busy || !accountId}
                className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
              >
                Create product
              </button>
            </div>
          </form>

          <ul className="mt-6 divide-y divide-white/10 border-t border-white/10">
            {products.length === 0 && (
              <li className="py-4 text-sm text-zinc-500">No products yet.</li>
            )}
            {products.map((product) => {
              const price =
                product.default_price && typeof product.default_price !== "string"
                  ? product.default_price
                  : null;
              return (
                <li key={product.id} className="flex items-start justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-white">{product.name}</p>
                    <p className="text-sm text-zinc-400">{product.description}</p>
                    <p className="mt-1 font-mono text-xs text-zinc-500">{product.id}</p>
                  </div>
                  <p className="text-sm text-amber-200">
                    {formatMoney(price?.unit_amount, price?.currency || "usd")}
                  </p>
                </li>
              );
            })}
          </ul>

          {storefrontPath && (
            <Link
              href={storefrontPath}
              className="mt-4 inline-flex text-sm font-medium text-amber-300 hover:text-amber-200"
            >
              Open storefront →
            </Link>
          )}
        </section>

        {/* 4. Platform subscription */}
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-medium text-white">4. Subscribe to Blueprint</h2>
          <p className="mt-2 text-sm text-zinc-400">
            Charges a platform subscription to this connected account using{" "}
            <code className="text-zinc-300">customer_account</code> (the same{" "}
            <code className="text-amber-200">acct_...</code> id). Requires{" "}
            <code className="text-zinc-300">STRIPE_PLATFORM_PRICE_ID</code>.
          </p>

          <p className="mt-4 text-sm text-zinc-300">
            Stored subscription status:{" "}
            <span className="font-medium text-white">
              {storedUser?.subscriptionStatus ?? "none"}
            </span>
            {storedUser?.subscriptionId ? (
              <>
                {" "}
                (<code className="text-xs text-zinc-500">{storedUser.subscriptionId}</code>)
              </>
            ) : null}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={busy || !accountId}
              onClick={subscribeToPlatform}
              className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-50"
            >
              Subscribe with Checkout
            </button>
            <button
              type="button"
              disabled={busy || !accountId}
              onClick={openBillingPortal}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5 disabled:opacity-50"
            >
              Open billing portal
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}

function StatusCard({
  label,
  value,
  ok,
}: {
  label: string;
  value: string;
  ok?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p
        className={`mt-1 text-sm font-medium ${
          ok === true ? "text-emerald-300" : ok === false ? "text-amber-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/** Suspense boundary required for useSearchParams in the App Router. */
export default function ConnectDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#09090b] text-zinc-400">
          Loading Connect dashboard…
        </div>
      }
    >
      <ConnectDashboardInner />
    </Suspense>
  );
}
