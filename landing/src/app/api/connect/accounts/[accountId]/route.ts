/**
 * GET /api/connect/accounts/[accountId]
 *
 * Fetch live onboarding / payments status from the Accounts v2 API.
 * Do NOT read cached status from the database for this demo — always hit Stripe.
 */
import { getStripeClient } from "@/lib/stripe";
import { deriveOnboardingStatus } from "@/lib/onboarding-status";
import { errorMessage, jsonError, jsonOk } from "@/lib/http";

type RouteContext = {
  params: Promise<{ accountId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { accountId } = await context.params;
    if (!accountId?.startsWith("acct_")) {
      return jsonError("accountId must be a Stripe account id (acct_...)");
    }

    const stripeClient = getStripeClient();

    // Include merchant configuration + requirements so we can derive readiness.
    const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
      include: ["configuration.merchant", "requirements"],
    });

    const status = deriveOnboardingStatus(account);
    return jsonOk({ status, accountId: account.id });
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}
