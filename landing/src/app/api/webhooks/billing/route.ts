/**
 * POST /api/webhooks/billing
 *
 * Snapshot (classic) webhooks for platform subscriptions charged to connected accounts.
 * These do NOT use thin events.
 *
 * Listen for the subscription / customer / portal events listed in the Connect sample
 * brief so you can grant or revoke product access when plans change.
 *
 * Local testing:
 *   stripe listen --events \
 *     customer.subscription.updated,customer.subscription.deleted,\
 *     payment_method.attached,payment_method.detached,customer.updated,\
 *     customer.tax_id.created,customer.tax_id.deleted,customer.tax_id.updated,\
 *     billing_portal.configuration.created,billing_portal.configuration.updated,\
 *     billing_portal.session.created \
 *     --forward-to localhost:3000/api/webhooks/billing
 *
 * Important for V2 Accounts:
 *   Prefer `subscription.customer_account` (acct_...) over `subscription.customer` (cus_...).
 */
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import {
  getBillingWebhookSecret,
  getStripeClient,
  stripeErrorMessage,
} from "@/lib/stripe";
import {
  type SubscriptionStatus,
  updateSubscriptionStatus,
} from "@/lib/store";

export const runtime = "nodejs";

function mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return status;
    default:
      return "none";
  }
}

/**
 * Resolve the connected account id from a Subscription.
 * V2 Accounts expose customer_account (acct_...); fall back carefully for older objects.
 */
function connectedAccountIdFromSubscription(sub: Stripe.Subscription): string | null {
  // Prefer customer_account for V2 Accounts (shape: acct_...).
  const customerAccount = (sub as Stripe.Subscription & { customer_account?: string | null })
    .customer_account;
  if (customerAccount && customerAccount.startsWith("acct_")) {
    return customerAccount;
  }
  return null;
}

async function syncSubscription(sub: Stripe.Subscription): Promise<void> {
  const accountId = connectedAccountIdFromSubscription(sub);
  if (!accountId) {
    console.warn(
      `[billing] Subscription ${sub.id} has no customer_account; cannot map to a Connect user.`,
    );
    return;
  }

  // TODO: DB write — persist plan / quantity / cancel_at_period_end for entitlement checks.
  const priceId = sub.items.data[0]?.price?.id;
  const quantity = sub.items.data[0]?.quantity;
  console.log(`[billing] sync subscription ${sub.id}`, {
    accountId,
    status: sub.status,
    priceId,
    quantity,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
    pauseCollection: sub.pause_collection,
  });

  await updateSubscriptionStatus({
    stripeAccountId: accountId,
    subscriptionStatus: mapSubscriptionStatus(sub.status),
    subscriptionId: sub.id,
  });
}

export async function POST(request: NextRequest) {
  const stripeClient = getStripeClient();
  const webhookSecret = getBillingWebhookSecret();

  const payload = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    // Snapshot events — verify with constructEvent (NOT parseEventNotification).
    event = stripeClient.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    console.error("[billing] signature verification failed:", err);
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "customer.subscription.updated": {
        // Covers upgrades/downgrades, quantity changes, pause/resume, and cancel_at_period_end.
        const subscription = event.data.object as Stripe.Subscription;
        await syncSubscription(subscription);

        if (subscription.cancel_at_period_end) {
          console.log(
            `[billing] Subscription ${subscription.id} will cancel at period end — keep access until then.`,
          );
        }
        if (subscription.pause_collection) {
          console.log(
            `[billing] Subscription ${subscription.id} collections paused until ${subscription.pause_collection.resumes_at}`,
          );
        }
        break;
      }

      case "customer.subscription.deleted": {
        // Immediate cancellation — revoke access.
        const subscription = event.data.object as Stripe.Subscription;
        const accountId = connectedAccountIdFromSubscription(subscription);
        if (accountId) {
          // TODO: DB write — revoke product entitlements for this connected account.
          await updateSubscriptionStatus({
            stripeAccountId: accountId,
            subscriptionStatus: "canceled",
            subscriptionId: subscription.id,
          });
        }
        break;
      }

      case "payment_method.attached": {
        const pm = event.data.object as Stripe.PaymentMethod;
        console.log(`[billing] payment_method.attached ${pm.id} customer=${pm.customer}`);
        // TODO: DB write — optional audit log of payment methods (never store raw PAN data).
        break;
      }

      case "payment_method.detached": {
        const pm = event.data.object as Stripe.PaymentMethod;
        console.log(`[billing] payment_method.detached ${pm.id}`);
        break;
      }

      case "customer.updated": {
        const customer = event.data.object as Stripe.Customer;
        console.log(`[billing] customer.updated ${customer.id}`, {
          defaultPaymentMethod: customer.invoice_settings?.default_payment_method,
        });
        // TODO: DB write — update billing contact fields only (never use email as a login credential).
        break;
      }

      case "customer.tax_id.created":
      case "customer.tax_id.deleted":
      case "customer.tax_id.updated": {
        console.log(`[billing] ${event.type}`, event.data.object);
        // TODO: DB write — mirror tax ID validation state if you display it in-app.
        break;
      }

      case "billing_portal.configuration.created":
      case "billing_portal.configuration.updated":
      case "billing_portal.session.created": {
        console.log(`[billing] ${event.type}`, (event.data.object as { id?: string }).id);
        break;
      }

      default: {
        console.log(`[billing] Unhandled event type: ${event.type}`);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[billing] handler error:", err);
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}
