/**
 * POST /api/webhooks/stripe
 *
 * Snapshot (v1) webhooks for platform subscriptions charged to connected accounts.
 * These do NOT use thin events — verify with constructEvent / webhooks.constructEvent.
 *
 * Listen for the subscription + billing-portal events listed in the task brief so
 * you only grant access while a subscription is active.
 *
 * Local Stripe CLI:
 *   stripe listen --forward-to localhost:3000/api/webhooks/stripe \
 *     --events customer.subscription.updated,customer.subscription.deleted,payment_method.attached,payment_method.detached,customer.updated,customer.tax_id.created,customer.tax_id.deleted,customer.tax_id.updated,billing_portal.configuration.created,billing_portal.configuration.updated,billing_portal.session.created
 *
 * Important for V2 accounts:
 *   Prefer subscription.customer_account (acct_...) over subscription.customer (cus_...).
 */
import type Stripe from "stripe";
import { getSnapshotWebhookSecret } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import {
  mapStripeSubscriptionStatus,
  upsertSubscriptionForAccount,
} from "@/lib/store";
import { errorMessage } from "@/lib/http";

export const runtime = "nodejs";

function connectedAccountIdFromSubscription(
  subscription: Stripe.Subscription,
): string | null {
  // V2: customer_account is the acct_... id shared by the connected account.
  if (subscription.customer_account) {
    return subscription.customer_account;
  }
  // Fallback for classic Customer objects (not expected for this V2 sample).
  if (typeof subscription.customer === "string") {
    return subscription.customer.startsWith("acct_")
      ? subscription.customer
      : null;
  }
  return null;
}

async function syncSubscription(subscription: Stripe.Subscription) {
  const accountId = connectedAccountIdFromSubscription(subscription);
  if (!accountId) {
    console.warn(
      "[snapshot] subscription missing customer_account — cannot map to a V2 connected account",
      subscription.id,
    );
    return;
  }

  // Pause collection: empty pause_collection means resumed; otherwise paused.
  let status = mapStripeSubscriptionStatus(subscription.status);
  if (subscription.pause_collection) {
    status = "paused";
  }

  // If cancel_at_period_end is true, access continues until period end —
  // keep status as the Stripe status (usually still "active") and let your
  // product layer read cancel_at_period_end if you need a soft-cancel flag.
  // TODO(database): also store cancel_at_period_end, price id, and quantity.
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const quantity = subscription.items.data[0]?.quantity ?? null;

  console.info("[snapshot] sync subscription", {
    accountId,
    subscriptionId: subscription.id,
    status,
    priceId,
    quantity,
    cancel_at_period_end: subscription.cancel_at_period_end,
    pause_collection: subscription.pause_collection ?? null,
  });

  // TODO(database): WRITE subscription status / entitlements here.
  await upsertSubscriptionForAccount({
    stripeAccountId: accountId,
    subscriptionStatus: status,
    stripeSubscriptionId: subscription.id,
  });
}

export async function POST(request: Request) {
  const stripeClient = getStripeClient();
  const webhookSecret = getSnapshotWebhookSecret();

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  } catch (err) {
    console.error("[snapshot] signature verification failed", err);
    return new Response(`Webhook Error: ${errorMessage(err)}`, { status: 400 });
  }

  try {
    switch (event.type) {
      /**
       * customer.subscription.updated
       * - Upgrades / downgrades → check items.data[0].price
       * - Quantity changes → check items.data[0].quantity
       * - Soft cancel → cancel_at_period_end === true
       * - Reactivation → cancel_at_period_end === false
       * - Pause / resume → pause_collection empty means resumed
       */
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);
        break;
      }

      /**
       * customer.subscription.deleted
       * Subscription fully canceled — revoke access to platform features.
       */
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const accountId = connectedAccountIdFromSubscription(subscription);
        if (accountId) {
          // TODO(database): revoke entitlements for this connected account.
          await upsertSubscriptionForAccount({
            stripeAccountId: accountId,
            subscriptionStatus: "canceled",
            stripeSubscriptionId: subscription.id,
          });
        }
        break;
      }

      case "payment_method.attached": {
        const pm = event.data.object as Stripe.PaymentMethod;
        console.info("[snapshot] payment_method.attached", {
          id: pm.id,
          customer: pm.customer,
          // V2 may surface related customer_account on some objects — log raw type.
          type: pm.type,
        });
        // TODO(database): optional audit log — do not use billing email as a login.
        break;
      }

      case "payment_method.detached": {
        const pm = event.data.object as Stripe.PaymentMethod;
        console.info("[snapshot] payment_method.detached", { id: pm.id });
        // TODO(database): optional audit log.
        break;
      }

      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        console.info("[snapshot] customer.updated", {
          id: customer.id,
          defaultPaymentMethod:
            customer.invoice_settings?.default_payment_method ?? null,
        });
        // TODO(database): update billing profile fields only — never treat email as auth.
        break;
      }

      case "customer.tax_id.created":
      case "customer.tax_id.deleted":
      case "customer.tax_id.updated": {
        console.info(`[snapshot] ${event.type}`, {
          id: (event.data.object as { id?: string }).id,
        });
        // TODO(database): sync tax ID records / validation status.
        break;
      }

      case "billing_portal.configuration.created":
      case "billing_portal.configuration.updated":
      case "billing_portal.session.created": {
        console.info(`[snapshot] ${event.type}`, {
          id: (event.data.object as { id?: string }).id,
        });
        break;
      }

      default: {
        console.info("[snapshot] unhandled event type", event.type);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[snapshot] handler error", err);
    return new Response(`Webhook Error: ${errorMessage(err)}`, { status: 500 });
  }
}
