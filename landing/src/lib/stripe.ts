/**
 * Stripe Client helper for the Connect sample integration.
 *
 * All Stripe API calls in this app MUST go through `getStripeClient()`.
 * The SDK automatically uses API version `2026-06-24.dahlia` (or the
 * version bundled with the installed `stripe` package) — do not set
 * `apiVersion` unless you intentionally need to pin a different version.
 */
import Stripe from "stripe";

/**
 * PLACEHOLDER: Set STRIPE_SECRET_KEY in `.env.local`.
 * Example: STRIPE_SECRET_KEY=sk_test_51...
 */
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

/** Lazily constructed singleton so we fail fast with a clear message. */
let stripeClient: Stripe | null = null;

/**
 * Returns a configured Stripe Client.
 * Throws a helpful Error if the secret key placeholder was never filled in.
 */
export function getStripeClient(): Stripe {
  // PLACEHOLDER check — never ship with an empty / placeholder key.
  if (
    !STRIPE_SECRET_KEY ||
    STRIPE_SECRET_KEY.includes("REPLACE_ME") ||
    !STRIPE_SECRET_KEY.startsWith("sk_")
  ) {
    throw new Error(
      "Missing Stripe secret key. Set STRIPE_SECRET_KEY in landing/.env.local " +
        "to a real key from https://dashboard.stripe.com/apikeys " +
        "(e.g. sk_test_...). See landing/.env.example.",
    );
  }

  if (!stripeClient) {
    // Use a Stripe Client for all requests (required by this sample).
    stripeClient = new Stripe(STRIPE_SECRET_KEY);
  }

  return stripeClient;
}

/**
 * Platform subscription Price ID (Blueprint plan sold TO connected accounts).
 * PLACEHOLDER: create a recurring Price in the Dashboard, then set STRIPE_PLATFORM_PRICE_ID.
 */
export function getPlatformPriceId(): string {
  const priceId = process.env.STRIPE_PLATFORM_PRICE_ID;
  if (!priceId || priceId.includes("REPLACE_ME") || !priceId.startsWith("price_")) {
    throw new Error(
      "Missing platform Price ID. Set STRIPE_PLATFORM_PRICE_ID in landing/.env.local " +
        "to a recurring price_... ID from the Stripe Dashboard (Products → Prices). " +
        "See landing/.env.example.",
    );
  }
  return priceId;
}

/** Thin-event webhook signing secret (V2 Account requirement / capability events). */
export function getThinWebhookSecret(): string {
  const secret = process.env.STRIPE_THIN_WEBHOOK_SECRET;
  if (!secret || secret.includes("REPLACE_ME") || !secret.startsWith("whsec_")) {
    throw new Error(
      "Missing thin webhook secret. Set STRIPE_THIN_WEBHOOK_SECRET in landing/.env.local. " +
        "Use the Dashboard (Developers → Webhooks, Thin payload) or: " +
        "stripe listen --thin-events '...' --forward-thin-to localhost:3000/api/webhooks/thin",
    );
  }
  return secret;
}

/** Snapshot webhook signing secret (Billing / subscription events). */
export function getBillingWebhookSecret(): string {
  const secret = process.env.STRIPE_BILLING_WEBHOOK_SECRET;
  if (!secret || secret.includes("REPLACE_ME") || !secret.startsWith("whsec_")) {
    throw new Error(
      "Missing billing webhook secret. Set STRIPE_BILLING_WEBHOOK_SECRET in landing/.env.local. " +
        "Use the Dashboard or: stripe listen --forward-to localhost:3000/api/webhooks/billing",
    );
  }
  return secret;
}

/**
 * Formats unknown Stripe / runtime errors into a JSON-safe message for API routes.
 */
export function stripeErrorMessage(err: unknown): string {
  if (err instanceof Stripe.errors.StripeError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return "Unexpected error talking to Stripe.";
}
