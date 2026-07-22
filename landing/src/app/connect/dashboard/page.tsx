"use client";

/**
 * Merchant dashboard UI.
 *
 * Steps:
 *  1. Create a Connected Account (Accounts v2)
 *  2. Onboard via Account Links + show live status from the API
 *  3. Create products on the connected account
 *  4. Subscribe the connected account to the platform plan / open Billing Portal
 */
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
  Suspense,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type DemoUser = {
  id: string;
  email: string;
  displayName: string;
  stripeAccountId: string | null;
  subscriptionStatus: string;
  stripeSubscriptionId: string | null;
};

type OnboardingStatus = {
  accountId: string;
  displayName: string | null;
  contactEmail: string | null;
  readyToProcessPayments: boolean;
  onboardingComplete: boolean;
  requirementsStatus: string | null;
  cardPaymentsStatus: string | null;
};

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

function redirectTo(url: string) {
  // Prefer assign() over setting location.href (React Compiler immutability lint).
  window.location.assign(url);
}

function DashboardInner() {
  const searchParams = useSearchParams();
  const accountIdFromUrl = searchParams.get("accountId") ?? "";

  const [users, setUsers] = useState<DemoUser[]>([]);
  // Prefer the URL account id when present; otherwise keep the user's selection.
  const [selectedAccountId, setSelectedAccountId] = useState(accountIdFromUrl);
  const activeAccountId = accountIdFromUrl || selectedAccountId;

  const [status, setStatus] = useState<OnboardingStatus | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productPrice, setProductPrice] = useState("19.99");

  const selectedUser = useMemo(
    () => users.find((u) => u.stripeAccountId === activeAccountId) ?? null,
    [users, activeAccountId],
  );

  const loadUsers = useCallback(async () => {
    const res = await fetch("/api/connect/accounts");
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load users");
    return (data.users ?? []) as DemoUser[];
  }, []);

  const loadStatus = useCallback(async (accountId: string) => {
    const res = await fetch(`/api/connect/accounts/${accountId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load account status");
    return data.status as OnboardingStatus;
  }, []);

  const loadProducts = useCallback(async (accountId: string) => {
    const res = await fetch(
      `/api/connect/products?accountId=${encodeURIComponent(accountId)}`,
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load products");
    return (data.products ?? []) as Product[];
  }, []);

  // Load the merchant list once on mount (external system: our demo store API).
  useEffect(() => {
    let cancelled = false;
    loadUsers()
      .then((nextUsers) => {
        if (!cancelled) {
          startTransition(() => setUsers(nextUsers));
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          startTransition(() => setError(err.message));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [loadUsers]);

  // When the active account changes, refresh live Stripe status + catalog.
  useEffect(() => {
    if (!activeAccountId) {
      startTransition(() => {
        setStatus(null);
        setProducts([]);
      });
      return;
    }

    let cancelled = false;
    Promise.all([loadStatus(activeAccountId), loadProducts(activeAccountId)])
      .then(([nextStatus, nextProducts]) => {
        if (!cancelled) {
          startTransition(() => {
            setStatus(nextStatus);
            setProducts(nextProducts);
            setError(null);
          });
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          startTransition(() => setError(err.message));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeAccountId, loadStatus, loadProducts]);

  async function onCreateAccount(e: FormEvent) {
    e.preventDefault();
    setBusy("create");
    setError(null);
    setMessage(null);
    try {
      const res = await fetch("/api/connect/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, contactEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create account");
      const nextUsers = await loadUsers();
      setUsers(nextUsers);
      setSelectedAccountId(data.account.id);
      setMessage(`Created connected account ${data.account.id}`);
      setDisplayName("");
      setContactEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onOnboard() {
    if (!activeAccountId) return;
    setBusy("onboard");
    setError(null);
    try {
      const res = await fetch(
        `/api/connect/accounts/${activeAccountId}/onboard`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create Account Link");
      redirectTo(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(null);
    }
  }

  async function onCreateProduct(e: FormEvent) {
    e.preventDefault();
    if (!activeAccountId) return;
    setBusy("product");
    setError(null);
    setMessage(null);
    try {
      const dollars = Number(productPrice);
      if (!Number.isFinite(dollars) || dollars <= 0) {
        throw new Error("Enter a valid price in dollars (e.g. 19.99)");
      }
      const priceInCents = Math.round(dollars * 100);
      const res = await fetch("/api/connect/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: activeAccountId,
          name: productName,
          description: productDescription,
          priceInCents,
          currency: "usd",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create product");
      setMessage(`Created product ${data.product.id}`);
      setProductName("");
      setProductDescription("");
      const nextProducts = await loadProducts(activeAccountId);
      setProducts(nextProducts);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(null);
    }
  }

  async function onSubscribe() {
    if (!activeAccountId) return;
    setBusy("subscribe");
    setError(null);
    try {
      const res = await fetch("/api/connect/subscription/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: activeAccountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to start subscription Checkout");
      redirectTo(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(null);
    }
  }

  async function onPortal() {
    if (!activeAccountId) return;
    setBusy("portal");
    setError(null);
    try {
      const res = await fetch("/api/connect/subscription/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: activeAccountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to open Billing Portal");
      redirectTo(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(null);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Merchant dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-zinc-400">
          Create a connected account, finish onboarding, publish products, and
          manage your platform subscription.
        </p>
      </div>

      {(error || message) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? "border-red-400/30 bg-red-400/10 text-red-200"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">1. Create connected account</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Uses Accounts v2 only — no top-level <code>type</code> field.
        </p>
        <form onSubmit={onCreateAccount} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-zinc-400">Display name</span>
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-amber-300/40"
              placeholder="Furever Pets"
            />
          </label>
          <label className="block text-sm">
            <span className="text-zinc-400">Contact email</span>
            <input
              required
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-amber-300/40"
              placeholder="seller@example.com"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={busy === "create"}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {busy === "create" ? "Creating…" : "Create account"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-lg font-semibold text-white">Select account</h2>
        <select
          className="mt-3 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-amber-300/40"
          value={activeAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
        >
          <option value="">Choose a connected account…</option>
          {users
            .filter((u) => u.stripeAccountId)
            .map((u) => (
              <option key={u.id} value={u.stripeAccountId!}>
                {u.displayName} — {u.stripeAccountId}
              </option>
            ))}
        </select>
        {activeAccountId && (
          <p className="mt-3 text-sm text-zinc-400">
            Storefront:{" "}
            <Link
              className="text-amber-200 underline-offset-2 hover:underline"
              href={`/connect/store/${activeAccountId}`}
            >
              /connect/store/{activeAccountId}
            </Link>
            {/* Production tip: prefer a slug / public store id over raw acct_ in URLs. */}
          </p>
        )}
      </section>

      {activeAccountId && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                2. Onboarding status
              </h2>
              <p className="mt-1 text-sm text-zinc-400">
                Status is fetched live from the Accounts API (not cached).
              </p>
            </div>
            <button
              type="button"
              onClick={onOnboard}
              disabled={busy === "onboard"}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {busy === "onboard" ? "Redirecting…" : "Onboard to collect payments"}
            </button>
          </div>

          {status ? (
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-zinc-500">Display name</dt>
                <dd className="text-zinc-200">{status.displayName ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Contact email</dt>
                <dd className="text-zinc-200">{status.contactEmail ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Requirements</dt>
                <dd className="text-zinc-200">
                  {status.requirementsStatus ?? "none"}{" "}
                  {status.onboardingComplete ? (
                    <span className="text-emerald-300">(complete)</span>
                  ) : (
                    <span className="text-amber-300">(action needed)</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Card payments</dt>
                <dd className="text-zinc-200">
                  {status.cardPaymentsStatus ?? "unknown"}{" "}
                  {status.readyToProcessPayments ? (
                    <span className="text-emerald-300">(ready)</span>
                  ) : (
                    <span className="text-amber-300">(not ready)</span>
                  )}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-zinc-500">Loading status…</p>
          )}
        </section>
      )}

      {activeAccountId && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">3. Create products</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Products are created on the connected account via the{" "}
            <code>Stripe-Account</code> header.
          </p>
          <form onSubmit={onCreateProduct} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-400">Name</span>
              <input
                required
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                placeholder="Handmade leash"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="text-zinc-400">Description</span>
              <input
                value={productDescription}
                onChange={(e) => setProductDescription(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                placeholder="Optional"
              />
            </label>
            <label className="block text-sm">
              <span className="text-zinc-400">Price (USD)</span>
              <input
                required
                value={productPrice}
                onChange={(e) => setProductPrice(e.target.value)}
                className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-white outline-none focus:border-amber-300/40"
                placeholder="19.99"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={busy === "product"}
                className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
              >
                {busy === "product" ? "Creating…" : "Create product"}
              </button>
            </div>
          </form>

          <ul className="mt-6 divide-y divide-white/10 border-t border-white/10">
            {products.length === 0 && (
              <li className="py-4 text-sm text-zinc-500">No products yet.</li>
            )}
            {products.map((p) => {
              const price =
                p.default_price && typeof p.default_price !== "string"
                  ? p.default_price
                  : null;
              return (
                <li key={p.id} className="flex items-center justify-between gap-4 py-4">
                  <div>
                    <p className="font-medium text-white">{p.name}</p>
                    <p className="text-sm text-zinc-500">{p.id}</p>
                  </div>
                  <p className="text-sm text-amber-200">
                    {formatMoney(price?.unit_amount, price?.currency ?? "usd")}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {activeAccountId && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-lg font-semibold text-white">
            4. Platform subscription
          </h2>
          <p className="mt-1 text-sm text-zinc-400">
            Bills the connected account via{" "}
            <code className="text-amber-200">customer_account</code>. Requires{" "}
            <code className="text-amber-200">STRIPE_PRICE_ID</code>.
          </p>
          <p className="mt-3 text-sm text-zinc-300">
            Stored status:{" "}
            <span className="font-medium text-white">
              {selectedUser?.subscriptionStatus ?? "none"}
            </span>
            {selectedUser?.stripeSubscriptionId
              ? ` (${selectedUser.stripeSubscriptionId})`
              : ""}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onSubscribe}
              disabled={busy === "subscribe"}
              className="rounded-full bg-amber-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300 disabled:opacity-60"
            >
              {busy === "subscribe" ? "Redirecting…" : "Subscribe to platform"}
            </button>
            <button
              type="button"
              onClick={onPortal}
              disabled={busy === "portal"}
              className="rounded-full border border-white/15 px-5 py-2 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5 disabled:opacity-60"
            >
              {busy === "portal" ? "Opening…" : "Open billing portal"}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ConnectDashboardPage() {
  return (
    <Suspense fallback={<p className="text-zinc-400">Loading dashboard…</p>}>
      <DashboardInner />
    </Suspense>
  );
}
