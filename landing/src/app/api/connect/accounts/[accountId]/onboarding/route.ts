import { NextResponse } from "next/server";
import { StripeConfigError } from "@/lib/stripe/config";
import { createAccountOnboardingLink } from "@/lib/stripe/accounts";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * POST /api/connect/accounts/:accountId/onboarding
 *
 * Step 2 — Create a V2 Account Link for Stripe-hosted onboarding.
 * Returns { url } — redirect the merchant to this URL.
 */
export async function POST(_request: Request, context: RouteContext) {
  try {
    const { accountId } = await context.params;

    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "Invalid account ID. Expected an acct_... identifier." },
        { status: 400 },
      );
    }

    const accountLink = await createAccountOnboardingLink(accountId);

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create account link:", error);
    return NextResponse.json(
      { error: "Failed to create onboarding link." },
      { status: 500 },
    );
  }
}
