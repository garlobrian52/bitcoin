/**
 * POST /api/webhooks/thin
 *
 * Handles V2 thin events for connected Account requirements & capability changes.
 *
 * Dashboard setup (Thin payload style):
 *   1. Developers → Webhooks → + Add destination
 *   2. Events from: Connected accounts
 *   3. Show advanced options → Payload style: Thin
 *   4. Subscribe to:
 *        - v2.core.account[requirements].updated
 *        - v2.core.account[configuration.merchant].capability_status_updated
 *        - v2.core.account[configuration.customer].capability_status_updated
 *        - v2.core.account[configuration.recipient].capability_status_updated
 *
 * Local testing with Stripe CLI:
 *   stripe listen --thin-events \
 *     'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
 *     --forward-thin-to localhost:3000/api/webhooks/thin
 *
 * Thin events are unversioned push notifications. After verifying the signature,
 * fetch the full event (and/or related Account) before acting on requirements.
 *
 * Docs: https://docs.stripe.com/webhooks.md?snapshot-or-thin=thin
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, getThinWebhookSecret, stripeErrorMessage } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripeClient = getStripeClient();
  const webhookSecret = getThinWebhookSecret();

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  try {
    // Newer SDKs name this parseEventNotification (docs historically said parseThinEvent).
    // It verifies the signature and returns a thin EventNotification.
    const thinEvent = stripeClient.parseEventNotification(
      payload,
      signature,
      webhookSecret,
    );

    // Fetch the versioned event for full context (required for thin payloads).
    // Equivalent to: await stripeClient.v2.core.events.retrieve(thinEvent.id)
    const event = await thinEvent.fetchEvent();

    switch (thinEvent.type) {
      case "v2.core.account[requirements].updated": {
        // Requirements changed — collect any newly due information via Account Links.
        const account = await thinEvent.fetchRelatedObject();
        console.log(`[thin] requirements.updated for account ${account.id}`, {
          eventId: event.id,
          relatedObjectId: thinEvent.related_object.id,
        });
        // TODO: Look up your user by account id and notify them to finish onboarding
        //       (create a fresh Account Link with type account_onboarding or account_update).
        break;
      }

      case "v2.core.account[configuration.merchant].capability_status_updated": {
        const account = await thinEvent.fetchRelatedObject();
        const cardStatus =
          account?.configuration?.merchant?.capabilities?.card_payments?.status;
        console.log(
          `[thin] merchant capability_status_updated for ${account?.id}: card_payments=${cardStatus}`,
        );
        // TODO: Enable / disable "Go live" features in your app based on capability status.
        break;
      }

      case "v2.core.account[configuration.customer].capability_status_updated": {
        const account = await thinEvent.fetchRelatedObject();
        console.log(
          `[thin] customer capability_status_updated for ${account?.id}`,
        );
        // TODO: Gate platform subscription / billing features on customer configuration readiness.
        break;
      }

      case "v2.core.account[configuration.recipient].capability_status_updated": {
        const account = await thinEvent.fetchRelatedObject();
        console.log(
          `[thin] recipient capability_status_updated for ${account?.id}`,
        );
        // TODO: If you use recipient payouts, react to capability changes here.
        break;
      }

      default: {
        // Unknown / future thin event types — still acknowledge so Stripe does not retry forever.
        console.log(`[thin] Unhandled thin event type: ${thinEvent.type} (${thinEvent.id})`);
        // Optionally: const full = await stripeClient.v2.core.events.retrieve(thinEvent.id);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[thin] webhook error:", err);
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 400 });
  }
}
