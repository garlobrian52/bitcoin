/**
 * POST /api/connect/accounts/[accountId]/onboard
 *
 * Create a V2 Account Link that sends the connected account through Stripe-hosted
 * onboarding for the `merchant` and `customer` configurations.
 */
import { getAppUrl } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { errorMessage, jsonError, jsonOk } from "@/lib/http";

type RouteContext = {
  params: Promise<{ accountId: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  try {
    const { accountId } = await context.params;
    if (!accountId?.startsWith("acct_")) {
      return jsonError("accountId must be a Stripe account id (acct_...)");
    }

    const appUrl = getAppUrl();
    const stripeClient = getStripeClient();

    // V2 Account Links use `use_case` instead of the older v1 `type` / `collect` fields.
    const accountLink = await stripeClient.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["merchant", "customer"],
          // If the link expires or is reused, Stripe sends the user here so we can mint a fresh link.
          refresh_url: `${appUrl}/connect/dashboard?accountId=${accountId}&refresh=1`,
          // After finishing (or exiting) onboarding, return to the merchant dashboard.
          return_url: `${appUrl}/connect/dashboard?accountId=${accountId}`,
        },
      },
    });

    return jsonOk({
      url: accountLink.url,
      expires_at: accountLink.expires_at,
    });
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}
