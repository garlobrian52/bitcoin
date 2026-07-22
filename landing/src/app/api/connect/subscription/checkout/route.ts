/**
 * POST /api/connect/subscription/checkout
 *
 * Charge a platform subscription TO the connected account using Hosted Checkout.
 *
 * With Accounts v2, the same `acct_...` id is used as `customer_account`
 * (do not create / pass a classic `cus_...` Customer id for this flow).
 */
import { getAppUrl, getPlatformPriceId } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { errorMessage, jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId?.startsWith("acct_")) {
      return jsonError("accountId (acct_...) is required");
    }

    // PLACEHOLDER: STRIPE_PRICE_ID must be a real recurring price on the platform.
    const priceId = getPlatformPriceId();
    const appUrl = getAppUrl();
    const stripeClient = getStripeClient();

    const session = await stripeClient.checkout.sessions.create({
      // V2: bill the connected account itself via customer_account (acct_...).
      customer_account: accountId,
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/connect/dashboard?accountId=${accountId}&subscribed=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/connect/dashboard?accountId=${accountId}&subscribed=0`,
    });

    if (!session.url) {
      return jsonError("Checkout Session was created without a redirect URL", 500);
    }

    return jsonOk({ url: session.url, sessionId: session.id });
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}
