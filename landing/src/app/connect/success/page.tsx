import Link from "next/link";

/**
 * Success page after a connected account subscribes to the platform plan.
 */
export default async function ConnectSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; accountId?: string }>;
}) {
  const { session_id: sessionId, accountId } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-zinc-100">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Subscription</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">You&apos;re subscribed</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Platform subscription Checkout completed
          {sessionId ? (
            <>
              {" "}
              (<code className="text-zinc-300">{sessionId}</code>)
            </>
          ) : null}
          . Billing webhooks will sync entitlement status shortly.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={accountId ? `/connect?accountId=${accountId}` : "/connect"}
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            Back to dashboard
          </Link>
          <Link
            href="/"
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
