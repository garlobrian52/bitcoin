<<<<<<< HEAD
/**
 * POST /api/connect/accounts — Create a V2 connected Account for a local user.
 * GET  /api/connect/accounts?userId=... — Look up the stored mapping.
 *
 * Uses ONLY the V2 Accounts API properties specified for this sample.
 * Never pass top-level `type: 'express' | 'standard' | 'custom'`.
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, stripeErrorMessage } from "@/lib/stripe";
import { getUserById, listUsers, saveConnectedAccount } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId");
    if (userId) {
      const user = await getUserById(userId);
      return NextResponse.json({ user });
    }
    const users = await listUsers();
    return NextResponse.json({ users });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      userId?: string;
=======
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
>>>>>>> origin/master
      displayName?: string;
      contactEmail?: string;
    };

<<<<<<< HEAD
    const userId = body.userId?.trim();
    const displayName = body.displayName?.trim();
    const contactEmail = body.contactEmail?.trim();

    if (!userId || !displayName || !contactEmail) {
      return NextResponse.json(
        {
          error:
            "userId, displayName, and contactEmail are required to create a connected account.",
        },
=======
    const displayName = body.displayName?.trim();
    const contactEmail = body.contactEmail?.trim();

    if (!displayName || !contactEmail) {
      return NextResponse.json(
        { error: "displayName and contactEmail are required." },
>>>>>>> origin/master
        { status: 400 },
      );
    }

<<<<<<< HEAD
    // Reuse an existing mapping if this demo user already has an account.
    const existing = await getUserById(userId);
    if (existing) {
      return NextResponse.json({
        accountId: existing.stripeAccountId,
        user: existing,
        reused: true,
      });
    }

    const stripeClient = getStripeClient();

    // Step: Create a V2 Core Account (Connect).
    // Docs: https://docs.stripe.com/api/v2/core/accounts/object
    // IMPORTANT: Do not pass top-level `type`. Use dashboard + configuration instead.
    const account = await stripeClient.v2.core.accounts.create({
      display_name: displayName,
      contact_email: contactEmail,
      identity: {
        country: "us",
      },
      dashboard: "full",
      defaults: {
        responsibilities: {
          fees_collector: "stripe",
          losses_collector: "stripe",
        },
      },
      configuration: {
        customer: {},
        merchant: {
          capabilities: {
            card_payments: {
              requested: true,
            },
          },
        },
      },
    });

    // Persist user → account mapping (file store today; replace with your DB).
    const user = await saveConnectedAccount({
      userId,
      stripeAccountId: account.id,
      displayName,
      contactEmail,
    });

    return NextResponse.json({ accountId: account.id, user, reused: false });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
=======
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
>>>>>>> origin/master
  }
}
