import Link from "next/link";

/**
 * Purchase success page after hosted Checkout (Direct Charge).
 */
export default async function StoreSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ accountId: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { accountId } = await params;
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#09090b] px-6 text-zinc-100">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-200/80">Payment</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Thanks for your purchase</h1>
        <p className="mt-3 text-sm text-zinc-400">
          Your Checkout Session completed successfully
          {sessionId ? (
            <>
              {" "}
              (<code className="text-zinc-300">{sessionId}</code>)
            </>
          ) : null}
          .
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/store/${accountId}`}
            className="rounded-full bg-amber-400 px-5 py-2.5 text-sm font-semibold text-zinc-950 transition hover:bg-amber-300"
          >
            Back to store
          </Link>
          <Link
            href={`/connect?accountId=${accountId}`}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/5"
          >
            Seller dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
