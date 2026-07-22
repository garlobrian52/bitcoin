import { NextResponse } from "next/server";
import { StripeConfigError } from "@/lib/stripe/config";
import {
  createConnectedAccount,
  getAccountOnboardingStatus,
} from "@/lib/stripe/accounts";
import {
  getUserByEmail,
  saveUserAccountMapping,
} from "@/lib/db/store";

/**
 * POST /api/connect/accounts
 *
 * Step 1 — Create a V2 connected account and store the user → account mapping.
 * Body: { displayName: string, contactEmail: string }
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      displayName?: string;
      contactEmail?: string;
    };

    const displayName = body.displayName?.trim();
    const contactEmail = body.contactEmail?.trim();

    if (!displayName || !contactEmail) {
      return NextResponse.json(
        { error: "displayName and contactEmail are required." },
        { status: 400 },
      );
    }

    // Reuse existing account if this demo user already onboarded
    const existing = getUserByEmail(contactEmail);
    if (existing) {
      const status = await getAccountOnboardingStatus(existing.stripeAccountId);
      return NextResponse.json({ user: existing, status, existing: true });
    }

    const account = await createConnectedAccount({ displayName, contactEmail });

    const user = saveUserAccountMapping({
      email: contactEmail,
      displayName,
      stripeAccountId: account.id,
    });

    const status = await getAccountOnboardingStatus(account.id);

    return NextResponse.json({ user, status, existing: false });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create connected account:", error);
    return NextResponse.json(
      { error: "Failed to create connected account." },
      { status: 500 },
    );
  }
}
