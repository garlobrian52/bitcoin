/**
 * POST /api/connect/billing-portal
 *
 * Creates a Billing Portal session so the connected account can manage
 * their platform subscription (upgrade / cancel / payment methods).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { getStripeClient, stripeErrorMessage } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required to open the billing portal." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();

    // V2 Accounts use customer_account (acct_...), not customer (cus_...).
    const session = await stripeClient.billingPortal.sessions.create({
      customer_account: accountId,
      return_url: `${appUrl}/connect?accountId=${accountId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}
