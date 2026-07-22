import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { StripeConfigError, getAppUrl } from "@/lib/stripe/config";

/**
 * POST /api/connect/billing-portal
 *
 * Create a Billing Portal session so the connected account can manage their subscription.
 * V2 Accounts use customer_account (acct_...), not customer (cus_...).
 * Body: { accountId }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "accountId must be a connected account ID (acct_...)." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();

    const session = await stripeClient.billingPortal.sessions.create({
      customer_account: accountId,
      return_url: `${appUrl}/connect?accountId=${accountId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create billing portal session:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session." },
      { status: 500 },
    );
  }
}
