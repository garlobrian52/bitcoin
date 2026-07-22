import { NextResponse } from "next/server";
import { StripeConfigError } from "@/lib/stripe/config";
import { getAccountOnboardingStatus } from "@/lib/stripe/accounts";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * GET /api/connect/accounts/:accountId
 *
 * Fetch live onboarding status from the Stripe Accounts API (not from a database).
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { accountId } = await context.params;

    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "Invalid account ID. Expected an acct_... identifier." },
        { status: 400 },
      );
    }

    const status = await getAccountOnboardingStatus(accountId);
    return NextResponse.json(status);
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to fetch account status:", error);
    return NextResponse.json(
      { error: "Failed to fetch account status." },
      { status: 500 },
    );
  }
}
