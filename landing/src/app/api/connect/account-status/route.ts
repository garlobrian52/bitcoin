/**
 * GET /api/connect/account-status?accountId=acct_...
 *
 * Always fetches live status from the Stripe Accounts API (never from our DB),
 * as required for this demo.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, stripeErrorMessage } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId")?.trim();
    if (!accountId) {
      return NextResponse.json(
        { error: "accountId query param is required." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();

    // Include merchant configuration + requirements so we can derive onboarding state.
    const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
      include: ["configuration.merchant", "configuration.customer", "requirements"],
    });

    const readyToProcessPayments =
      account?.configuration?.merchant?.capabilities?.card_payments?.status === "active";

    const requirementsStatus =
      account.requirements?.summary?.minimum_deadline?.status;

    // Onboarding is complete when there is nothing currently or past due.
    const onboardingComplete =
      requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

    return NextResponse.json({
      accountId: account.id,
      displayName: account.display_name,
      contactEmail: account.contact_email,
      dashboard: account.dashboard,
      appliedConfigurations: account.applied_configurations,
      cardPaymentsStatus:
        account.configuration?.merchant?.capabilities?.card_payments?.status ?? "unknown",
      requirementsStatus: requirementsStatus ?? "none",
      readyToProcessPayments,
      onboardingComplete,
      // Raw slices useful for debugging the UI — never cache these in production DB for this demo.
      requirementsSummary: account.requirements?.summary ?? null,
    });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}
