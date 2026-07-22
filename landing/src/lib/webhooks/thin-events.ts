import type Stripe from "stripe";
import { getStripeClient } from "@/lib/stripe/client";

/**
 * Handle thin (V2) webhook events for connected account requirement changes.
 *
 * Configure in Stripe Dashboard → Developers → Webhooks → Add destination:
 *   - Events from: Connected accounts
 *   - Payload style: Thin
 *   - Events: v2.core.account[requirements].updated,
 *             v2.core.account[configuration.merchant].capability_status_updated,
 *             v2.core.account[configuration.customer].capability_status_updated
 *
 * Local testing with Stripe CLI:
 *   stripe listen --thin-events \
 *     'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
 *     --forward-thin-to http://localhost:3000/api/webhooks/stripe
 */
export async function handleThinWebhookEvent(
  event: Stripe.V2.Core.Event,
): Promise<void> {
  const stripeClient = getStripeClient();

  switch (event.type) {
    case "v2.core.account[requirements].updated": {
      // Requirements changed — fetch latest account state and collect any new info
      const accountId = extractAccountId(event);
      if (!accountId) break;

      const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
        include: ["requirements", "configuration.merchant"],
      });

      console.info(
        `[thin webhook] Requirements updated for ${accountId}:`,
        account.requirements?.summary?.minimum_deadline?.status,
      );
      // TODO: notify the merchant in your app / send email when requirements are due
      break;
    }

    case "v2.core.account[configuration.merchant].capability_status_updated": {
      const accountId = extractAccountId(event);
      if (!accountId) break;

      const account = await stripeClient.v2.core.accounts.retrieve(accountId, {
        include: ["configuration.merchant"],
      });

      const cardStatus =
        account.configuration?.merchant?.capabilities?.card_payments?.status;

      console.info(
        `[thin webhook] Merchant card_payments capability for ${accountId}: ${cardStatus}`,
      );
      // TODO: update merchant dashboard when payments become active
      break;
    }

    case "v2.core.account[configuration.customer].capability_status_updated": {
      const accountId = extractAccountId(event);
      if (!accountId) break;

      console.info(
        `[thin webhook] Customer configuration capability updated for ${accountId}`,
      );
      break;
    }

    case "v2.core.account[configuration.recipient].capability_status_updated": {
      const accountId = extractAccountId(event);
      if (!accountId) break;

      console.info(
        `[thin webhook] Recipient configuration capability updated for ${accountId}`,
      );
      break;
    }

    default:
      console.info(`[thin webhook] Unhandled event type: ${event.type}`);
  }
}

/** Extract connected account ID from a V2 thin event payload. */
function extractAccountId(event: Stripe.V2.Core.Event): string | null {
  // V2 events reference the account via related_object.id (acct_...)
  if ("related_object" in event && event.related_object?.id) {
    return event.related_object.id;
  }
  return null;
}
