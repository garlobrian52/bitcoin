/**
 * POST /api/connect/accounts
 *   Create a local demo user + a Stripe Connected Account (Accounts v2).
 *
 * GET  /api/connect/accounts
 *   List local users and their stored stripe_account_id mappings.
 *
 * Creating Connected Accounts — use ONLY the properties below. Never pass
 * top-level `type: 'express' | 'standard' | 'custom'` with Accounts v2.
 */
import { getStripeClient } from "@/lib/stripe";
import { createUser, listUsers, setUserStripeAccountId } from "@/lib/store";
import { errorMessage, jsonError, jsonOk } from "@/lib/http";

export async function GET() {
  const users = await listUsers();
  return jsonOk({ users });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      displayName?: string;
      contactEmail?: string;
    };

    const displayName = body.displayName?.trim();
    const contactEmail = body.contactEmail?.trim();

    if (!displayName) {
      return jsonError("displayName is required");
    }
    if (!contactEmail) {
      return jsonError("contactEmail is required");
    }

    // 1) Create a local user row first so we always have a mapping target.
    // TODO(database): wrap user + account creation in a transaction.
    const user = await createUser({
      email: contactEmail,
      displayName,
      stripeAccountId: null,
    });

    // 2) Create the Connected Account via Accounts v2 on the platform.
    const stripeClient = getStripeClient();
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

    // 3) Store the user → account ID mapping.
    // TODO(database): UPDATE users SET stripe_account_id = account.id WHERE id = user.id
    const updated = await setUserStripeAccountId(user.id, account.id);

    return jsonOk(
      {
        user: updated,
        account: {
          id: account.id,
          display_name: account.display_name,
          contact_email: account.contact_email,
        },
      },
      201,
    );
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}
