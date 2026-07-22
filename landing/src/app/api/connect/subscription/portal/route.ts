/**
 * POST /api/connect/subscription/portal
 *
 * Open the Stripe Billing Portal so the connected account can manage their
 * platform subscription (upgrade / cancel / payment methods).
 */
import { getAppUrl } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { errorMessage, jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { accountId?: string };
    const accountId = body.accountId?.trim();

    if (!accountId?.startsWith("acct_")) {
      return jsonError("accountId (acct_...) is required");
    }

    const appUrl = getAppUrl();
    const stripeClient = getStripeClient();

    const session = await stripeClient.billingPortal.sessions.create({
      // V2 accounts: use customer_account (acct_...), not customer (cus_...).
      customer_account: accountId,
      return_url: `${appUrl}/connect/dashboard?accountId=${accountId}`,
    });

    return jsonOk({ url: session.url });
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}
