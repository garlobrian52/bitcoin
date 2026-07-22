/**
 * POST /api/connect/subscribe
 *
 * Charge a platform subscription TO a connected account.
 * With V2 accounts, the same acct_... id is used as `customer_account`
 * (do not use classic cus_... customer ids for this flow).
 */
import { NextRequest, NextResponse } from "next/server";
import { getAppUrl } from "@/lib/app-url";
import { getPlatformPriceId, getStripeClient, stripeErrorMessage } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId) {
      return NextResponse.json(
        { error: "accountId (connected account) is required to start a subscription." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();
    // PLACEHOLDER-backed: throws a clear error if STRIPE_PLATFORM_PRICE_ID is unset.
    const priceId = getPlatformPriceId();

    // Hosted Checkout in subscription mode on the platform (not on the connected account).
    // customer_account ties billing to the V2 Account id.
    const session = await stripeClient.checkout.sessions.create({
      customer_account: accountId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/connect/success?session_id={CHECKOUT_SESSION_ID}&accountId=${accountId}`,
      cancel_url: `${appUrl}/connect?accountId=${accountId}`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Subscription Checkout Session was created without a hosted URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}
