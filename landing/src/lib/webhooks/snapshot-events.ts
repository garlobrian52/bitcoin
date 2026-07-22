import type Stripe from "stripe";
import { upsertSubscriptionStatus } from "@/lib/db/store";

/**
 * Handle snapshot (V1) webhook events for platform subscriptions billed to connected accounts.
 *
 * These are standard webhook events — NOT thin events.
 * Configure a separate webhook destination in the Dashboard for your platform account.
 *
 * Recommended events:
 *   customer.subscription.updated, customer.subscription.deleted,
 *   payment_method.attached, payment_method.detached, customer.updated,
 *   customer.tax_id.created, customer.tax_id.deleted, customer.tax_id.updated,
 *   billing_portal.configuration.created, billing_portal.configuration.updated,
 *   billing_portal.session.created
 */
export function handleSnapshotWebhookEvent(event: Stripe.Event): void {
  switch (event.type) {
    case "customer.subscription.updated":
      handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
      break;

    case "customer.subscription.deleted":
      handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
      break;

    case "payment_method.attached":
      console.info(
        `[snapshot webhook] Payment method attached: ${(event.data.object as Stripe.PaymentMethod).id}`,
      );
      break;

    case "payment_method.detached":
      console.info(
        `[snapshot webhook] Payment method detached: ${(event.data.object as Stripe.PaymentMethod).id}`,
      );
      break;

    case "customer.updated": {
      const customer = event.data.object as Stripe.Customer;
      console.info(
        `[snapshot webhook] Customer updated: ${customer.id}, default PM: ${customer.invoice_settings?.default_payment_method}`,
      );
      // TODO: sync billing info to your database (never use billing email as login credential)
      break;
    }

    case "customer.tax_id.created":
    case "customer.tax_id.deleted":
    case "customer.tax_id.updated":
      console.info(`[snapshot webhook] Tax ID event: ${event.type}`);
      break;

    case "billing_portal.configuration.created":
    case "billing_portal.configuration.updated":
    case "billing_portal.session.created":
      console.info(`[snapshot webhook] Billing portal event: ${event.type}`);
      break;

    default:
      console.info(`[snapshot webhook] Unhandled event type: ${event.type}`);
  }
}

/** Monitor upgrades, downgrades, quantity changes, pause/resume, and pending cancellations. */
function handleSubscriptionUpdated(subscription: Stripe.Subscription): void {
  // For V2 accounts use customer_account (acct_...), not customer (cus_...)
  const customerAccount =
    (subscription as Stripe.Subscription & { customer_account?: string })
      .customer_account ?? null;

  if (!customerAccount) {
    console.warn(
      "[snapshot webhook] subscription.updated without customer_account — skipping DB write",
    );
    return;
  }

  const item = subscription.items.data[0];
  const priceId = item?.price?.id ?? null;
  const quantity = item?.quantity ?? 1;

  upsertSubscriptionStatus({
    customerAccount,
    subscriptionId: subscription.id,
    status: subscription.status,
    priceId,
    quantity,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    pauseCollection: Boolean(subscription.pause_collection),
    updatedAt: new Date().toISOString(),
  });

  console.info(
    `[snapshot webhook] Subscription ${subscription.id} → ${subscription.status}` +
      ` (price: ${priceId}, qty: ${quantity}, cancel_at_period_end: ${subscription.cancel_at_period_end})`,
  );

  // TODO: grant/revoke product access based on priceId and quantity
}

/** Revoke access when a subscription is fully canceled. */
function handleSubscriptionDeleted(subscription: Stripe.Subscription): void {
  const customerAccount =
    (subscription as Stripe.Subscription & { customer_account?: string })
      .customer_account ?? null;

  if (!customerAccount) return;

  upsertSubscriptionStatus({
    customerAccount,
    subscriptionId: subscription.id,
    status: "canceled",
    priceId: subscription.items.data[0]?.price?.id ?? null,
    quantity: 0,
    cancelAtPeriodEnd: false,
    pauseCollection: false,
    updatedAt: new Date().toISOString(),
  });

  console.info(
    `[snapshot webhook] Subscription canceled for account ${customerAccount}`,
  );

  // TODO: revoke product access for this connected account
}
