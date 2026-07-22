"use client";

/**
 * Hosted Checkout success page for Direct Charge purchases.
 */
import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const accountId = searchParams.get("accountId");

  return (
    <div className="mx-auto max-w-lg text-center">
      <p className="mb-4 inline-flex items-center rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.2em] text-emerald-200">
        Payment complete
      </p>
      <h1 className="text-3xl font-semibold tracking-tight text-white">
        Thanks for your purchase
      </h1>
      <p className="mt-3 text-zinc-400">
        The Direct Charge settled on the connected account, and the platform
        collected an application fee.
      </p>
      {sessionId && (
        <p className="mt-4 break-all text-xs text-zinc-500">
          Checkout Session: {sessionId}
        </p>
      )}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        {accountId && (
          <Link
            href={`/connect/store/${accountId}`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-amber-400 px-5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            Back to store
          </Link>
        )}
        <Link
          href="/connect/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 px-5 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5"
        >
          Merchant dashboard
        </Link>
      </div>
    </div>
  );
}

export default function ConnectSuccessPage() {
  return (
    <Suspense fallback={<p className="text-center text-zinc-400">Loading…</p>}>
      <SuccessInner />
    </Suspense>
  );
}
