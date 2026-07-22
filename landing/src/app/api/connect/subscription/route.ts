import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import {
  StripeConfigError,
  getAppUrl,
  getPlatformSubscriptionPriceId,
} from "@/lib/stripe/config";

/**
 * POST /api/connect/subscription
 *
 * Create a hosted Checkout session to charge a subscription to the connected account.
 * V2 accounts use customer_account (acct_...) instead of a separate customer ID.
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
    const priceId = getPlatformSubscriptionPriceId();

    const session = await stripeClient.checkout.sessions.create({
      // V2: one ID serves as both customer and connected account
      customer_account: accountId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/connect?accountId=${accountId}&subscription=success`,
      cancel_url: `${appUrl}/connect?accountId=${accountId}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create subscription checkout:", error);
    return NextResponse.json(
      { error: "Failed to create subscription checkout session." },
      { status: 500 },
    );
  }
}
