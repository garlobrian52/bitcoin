<<<<<<< HEAD
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
=======
import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { StripeConfigError, getAppUrl } from "@/lib/stripe/config";

/**
 * POST /api/connect/billing-portal
 *
 * Create a Billing Portal session so the connected account can manage their subscription.
 * Body: { accountId }
 */
export async function POST(request: Request) {
>>>>>>> origin/master
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

<<<<<<< HEAD
    if (!accountId) {
      return NextResponse.json(
        { error: "accountId is required to open the billing portal." },
=======
    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "accountId must be a connected account ID (acct_...)." },
>>>>>>> origin/master
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();

<<<<<<< HEAD
    // V2 Accounts use customer_account (acct_...), not customer (cus_...).
=======
>>>>>>> origin/master
    const session = await stripeClient.billingPortal.sessions.create({
      customer_account: accountId,
      return_url: `${appUrl}/connect?accountId=${accountId}`,
    });

    return NextResponse.json({ url: session.url });
<<<<<<< HEAD
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
=======
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create billing portal session:", error);
    return NextResponse.json(
      { error: "Failed to create billing portal session." },
      { status: 500 },
    );
>>>>>>> origin/master
  }
}
