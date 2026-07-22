import Link from "next/link";
import { connectStyles as s } from "@/components/connect/styles";

type PageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

/** Shown after a successful hosted Checkout payment. */
export default async function SuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <div className={s.page}>
      <main className={`${s.container} text-center`}>
        <div className={s.card}>
          <h1 className="text-2xl font-semibold text-white">
            Payment successful
          </h1>
          <p className="mt-2 text-zinc-400">
            Thank you for your purchase.
          </p>
          {params.session_id && (
            <p className="mt-4 text-xs text-zinc-500">
              Session: <code>{params.session_id}</code>
            </p>
          )}
          <Link href="/" className={`${s.buttonPrimary} mt-6 inline-flex`}>
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
