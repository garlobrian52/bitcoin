import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { optionalEnv, requireEnv, StripeConfigError } from "@/lib/stripe/config";
import { handleThinWebhookEvent } from "@/lib/webhooks/thin-events";
import { handleSnapshotWebhookEvent } from "@/lib/webhooks/snapshot-events";

/**
 * POST /api/webhooks/stripe
 *
 * Unified webhook endpoint that handles:
 *   1. Thin events (V2 connected account updates) — parsed with parseEventNotification
 *   2. Snapshot events (subscription lifecycle) — parsed with webhooks.constructEvent
 *
 * Set up two webhook destinations in the Stripe Dashboard, or use the Stripe CLI:
 *
 * Thin events (connected accounts):
 *   stripe listen --thin-events \
 *     'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
 *     --forward-thin-to http://localhost:3000/api/webhooks/stripe
 *
 * Snapshot events (platform subscriptions):
 *   stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
 */
export async function POST(request: Request) {
  const stripeClient = getStripeClient();
  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe-Signature header." },
      { status: 400 },
    );
  }

  try {
    // --- Attempt thin event parsing first (V2 connected account events) ---
    // PLACEHOLDER: set STRIPE_WEBHOOK_SECRET_THIN from your thin-event destination
    const thinSecret = optionalEnv("STRIPE_WEBHOOK_SECRET_THIN");
    if (thinSecret) {
      try {
        // SDK v22+ uses parseEventNotification (formerly parseThinEvent)
        const thinNotification = stripeClient.parseEventNotification(
          payload,
          signature,
          thinSecret,
        );

        // Fetch the full event payload to understand what changed
        const event = await stripeClient.v2.core.events.retrieve(
          thinNotification.id,
        );

        await handleThinWebhookEvent(event);
        return NextResponse.json({ received: true, type: "thin" });
      } catch {
        // Not a thin event — fall through to snapshot parsing
      }
    }

    // --- Snapshot event parsing (subscription / billing events) ---
    // PLACEHOLDER: set STRIPE_WEBHOOK_SECRET from your snapshot webhook destination
    const snapshotSecret = requireEnv("STRIPE_WEBHOOK_SECRET");
    const event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      snapshotSecret,
    );

    handleSnapshotWebhookEvent(event);
    return NextResponse.json({ received: true, type: "snapshot" });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook signature verification failed." },
      { status: 400 },
    );
  }
}
