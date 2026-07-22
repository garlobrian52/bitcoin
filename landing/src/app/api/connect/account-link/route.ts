/**
 * POST /api/connect/account-link — Create a V2 Account Link for onboarding.
 *
 * The seller is redirected to Stripe-hosted onboarding, then back to return_url.
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
        { error: "accountId is required to start Connect onboarding." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();

    // Step: Create a V2 Account Link for account_onboarding.
    // Collect both merchant (accept payments) and customer (platform billing) configs.
    const accountLink = await stripeClient.v2.core.accountLinks.create({
      account: accountId,
      use_case: {
        type: "account_onboarding",
        account_onboarding: {
          configurations: ["merchant", "customer"],
          // If the link expires, Stripe sends the user here so we can mint a fresh link.
          refresh_url: `${appUrl}/connect?accountId=${accountId}&refresh=1`,
          // After onboarding, return to the seller dashboard with the account id.
          return_url: `${appUrl}/connect?accountId=${accountId}&onboarded=1`,
        },
      },
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}
