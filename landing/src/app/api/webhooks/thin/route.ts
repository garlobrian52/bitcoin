/**
 * POST /api/webhooks/thin
 *
 * Thin-event destination for Accounts v2 requirement / capability updates.
 *
 * Dashboard setup (thin payload style):
 *   1. Developers → Webhooks → + Add destination
 *   2. Events from: Connected accounts
 *   3. Show advanced options → Payload style: Thin
 *   4. Select:
 *        - v2.core.account[requirements].updated
 *        - v2.core.account[configuration.merchant].capability_status_updated
 *        - v2.core.account[configuration.customer].capability_status_updated
 *        - v2.core.account[configuration.recipient].capability_status_updated
 *
 * Local Stripe CLI:
 *   stripe listen --thin-events \
 *     'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
 *     --forward-thin-to localhost:3000/api/webhooks/thin
 *
 * Docs: https://docs.stripe.com/webhooks.md?snapshot-or-thin=thin
 *
 * NOTE: In stripe-node v22+, `parseThinEvent` was renamed to `parseEventNotification`.
 * Prefer `thinEvent.fetchEvent()` / `fetchRelatedObject()`; you can also call
 * `stripeClient.v2.core.events.retrieve(thinEvent.id)` as in older samples.
 */
import type Stripe from "stripe";
import { getThinWebhookSecret } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { deriveOnboardingStatus } from "@/lib/onboarding-status";
import { errorMessage } from "@/lib/http";

export const runtime = "nodejs";

async function loadRelatedAccount(
  stripeClient: Stripe,
  relatedObjectId: string,
): Promise<Stripe.V2.Core.Account> {
  return stripeClient.v2.core.accounts.retrieve(relatedObjectId, {
    include: ["configuration.merchant", "requirements"],
  });
}

export async function POST(request: Request) {
  const stripeClient = getStripeClient();
  const webhookSecret = getThinWebhookSecret();

  // Stripe signature verification requires the RAW body (not parsed JSON).
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  try {
    // Formerly named parseThinEvent — parses a thin Event Notification.
    const thinEvent = stripeClient.parseEventNotification(
      payload,
      signature,
      webhookSecret,
    );

    // Fetch the full event payload (thin notifications are intentionally small).
    // Equivalent: await stripeClient.v2.core.events.retrieve(thinEvent.id)
    const event = await thinEvent.fetchEvent();

    switch (event.type) {
      case "v2.core.account[requirements].updated": {
        // Account requirements changed (regulators / networks / risk). Re-fetch
        // the Account and collect any newly due requirements via Account Links.
        const account = await event.fetchRelatedObject();
        const status = deriveOnboardingStatus(account);
        console.info("[thin] requirements.updated", {
          accountId: status.accountId,
          requirementsStatus: status.requirementsStatus,
          onboardingComplete: status.onboardingComplete,
          readyToProcessPayments: status.readyToProcessPayments,
        });

        // TODO(database): persist that this account needs attention / email the user.
        // TODO(product): if !onboardingComplete, prompt them to open a new Account Link
        // with use_case.type = 'account_update'.
        break;
      }

      case "v2.core.account[configuration.merchant].capability_status_updated": {
        const account = await event.fetchRelatedObject();
        const status = deriveOnboardingStatus(account);
        console.info("[thin] merchant.capability_status_updated", {
          accountId: status.accountId,
          cardPaymentsStatus: status.cardPaymentsStatus,
          readyToProcessPayments: status.readyToProcessPayments,
        });

        // TODO(database): update merchant capability flags if you cache them.
        // For this demo we always re-read from the API on the dashboard.
        break;
      }

      case "v2.core.account[configuration.customer].capability_status_updated": {
        // related_object points at the Account; re-fetch if you need full config.
        const account = await loadRelatedAccount(
          stripeClient,
          event.related_object.id,
        );
        console.info("[thin] customer.capability_status_updated", {
          accountId: account.id,
        });
        // TODO(database): track customer-configuration capability changes.
        break;
      }

      case "v2.core.account[configuration.recipient].capability_status_updated": {
        const account = await loadRelatedAccount(
          stripeClient,
          event.related_object.id,
        );
        console.info("[thin] recipient.capability_status_updated", {
          accountId: account.id,
        });
        // TODO(database): track recipient-configuration capability changes.
        break;
      }

      default: {
        console.info("[thin] unhandled event type", event.type);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[thin] webhook error", err);
    return new Response(`Webhook Error: ${errorMessage(err)}`, { status: 400 });
  }
}
