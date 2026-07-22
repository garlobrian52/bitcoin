"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { connectStyles as s } from "./styles";

export type AccountStatus = {
  accountId: string;
  displayName: string | null;
  contactEmail: string | null;
  readyToProcessPayments: boolean;
  onboardingComplete: boolean;
  cardPaymentsStatus: string | null;
  requirementsStatus: string | null;
};

type Props = {
  initialAccountId?: string;
};

/**
 * Merchant dashboard — create a connected account, onboard, and manage subscriptions.
 */
export function ConnectDashboard({ initialAccountId }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [accountId, setAccountId] = useState(initialAccountId ?? "");
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  /** Fetch live onboarding status from the Stripe API (not from a database). */
  const refreshStatus = useCallback(async (id: string) => {
    const res = await fetch(`/api/connect/accounts/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Failed to fetch status");
    setStatus(data);
  }, []);

  useEffect(() => {
    if (initialAccountId) {
      refreshStatus(initialAccountId).catch((e: Error) =>
        setError(e.message),
      );
    }
  }, [initialAccountId, refreshStatus]);

  /** Step 1: Create a V2 connected account */
  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/connect/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, contactEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create account");

      setAccountId(data.user.stripeAccountId);
      setStatus(data.status);
      setMessage(
        data.existing
          ? "Welcome back — loaded your existing connected account."
          : "Connected account created. Continue with onboarding below.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  /** Step 2: Redirect to Stripe-hosted onboarding via Account Link */
  async function handleOnboard() {
    if (!accountId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `/api/connect/accounts/${accountId}/onboarding`,
        { method: "POST" },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create link");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  /** Subscribe the connected account to the platform (hosted Checkout) */
  async function handleSubscribe() {
    if (!accountId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/connect/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to start subscription");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  /** Open the Billing Portal to manage subscription */
  async function handleBillingPortal() {
    if (!accountId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/connect/billing-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to open portal");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {error && <div className={s.error}>{error}</div>}
      {message && <div className={s.success}>{message}</div>}

      {/* Step 1 — Create connected account */}
      <section className={s.card}>
        <h2 className="mb-1 text-lg font-semibold text-white">
          1. Create connected account
        </h2>
        <p className="mb-4 text-sm text-zinc-400">
          Creates a V2 account with merchant and customer configurations. Your
          user → account mapping is stored in memory (use a database in
          production).
        </p>

        <form onSubmit={handleCreateAccount} className="space-y-4">
          <div>
            <label className={s.label} htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              className={s.input}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Acme Corp"
              required
            />
          </div>
          <div>
            <label className={s.label} htmlFor="contactEmail">
              Contact email
            </label>
            <input
              id="contactEmail"
              type="email"
              className={s.input}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" className={s.buttonPrimary} disabled={loading}>
            {loading ? "Working…" : "Create connected account"}
          </button>
        </form>
      </section>

      {/* Step 2 — Onboarding status & Account Link */}
      {accountId && (
        <section className={s.card}>
          <h2 className="mb-1 text-lg font-semibold text-white">
            2. Onboard to collect payments
          </h2>
          <p className="mb-4 text-sm text-zinc-400">
            Status is fetched live from the Stripe Accounts API on every page
            load (not stored in a database).
          </p>

          <div className="mb-4 space-y-2 rounded-lg bg-white/[0.02] p-4 text-sm">
            <p>
              <span className="text-zinc-500">Account ID:</span>{" "}
              <code className="text-amber-200">{accountId}</code>
            </p>
            {status && (
              <>
                <div className="flex flex-wrap gap-2 pt-1">
                  <span
                    className={
                      status.readyToProcessPayments
                        ? s.badgeActive
                        : s.badgePending
                    }
                  >
                    Card payments: {status.cardPaymentsStatus ?? "unknown"}
                  </span>
                  <span
                    className={
                      status.onboardingComplete
                        ? s.badgeActive
                        : s.badgePending
                    }
                  >
                    Requirements: {status.requirementsStatus ?? "none due"}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={s.buttonPrimary}
              onClick={handleOnboard}
              disabled={loading}
            >
              Onboard to collect payments
            </button>
            <button
              type="button"
              className={s.buttonSecondary}
              onClick={() => refreshStatus(accountId)}
              disabled={loading}
            >
              Refresh status
            </button>
          </div>
        </section>
      )}

      {/* Step 3 — Products */}
      {accountId && status?.readyToProcessPayments && (
        <section className={s.card}>
          <h2 className="mb-1 text-lg font-semibold text-white">
            3. Create products
          </h2>
          <p className="mb-4 text-sm text-zinc-400">
            Add products to your connected account, then share your storefront
            link with customers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/connect/products?accountId=${accountId}`}
              className={s.buttonPrimary}
            >
              Manage products
            </Link>
            <Link
              href={`/storefront/${accountId}`}
              className={s.buttonSecondary}
            >
              View storefront
            </Link>
          </div>
        </section>
      )}

      {/* Platform subscription */}
      {accountId && (
        <section className={s.card}>
          <h2 className="mb-1 text-lg font-semibold text-white">
            Platform subscription
          </h2>
          <p className="mb-4 text-sm text-zinc-400">
            Charge the connected account a recurring platform fee using{" "}
            <code className="text-amber-200">customer_account</code> (V2 — same
            ID as the connected account).
          </p>
          {subscriptionStatus && (
            <p className="mb-3 text-sm text-emerald-300">
              Subscription status: {subscriptionStatus}
            </p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={s.buttonPrimary}
              onClick={handleSubscribe}
              disabled={loading}
            >
              Subscribe to platform
            </button>
            <button
              type="button"
              className={s.buttonSecondary}
              onClick={handleBillingPortal}
              disabled={loading}
            >
              Manage billing
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
