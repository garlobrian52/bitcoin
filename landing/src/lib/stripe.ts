/**
 * Shared Stripe Client for the Connect sample.
 *
 * Always construct requests through `stripeClient` (never a one-off `Stripe()`
 * instance elsewhere) so API version, retries, and auth stay consistent.
 *
 * The SDK pins API version `2026-06-24.dahlia` automatically — do not set
 * `apiVersion` unless you intentionally need a different version.
 */
import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/env";

declare global {
  var __blueprintStripeClient: Stripe | undefined;
}

/**
 * Returns the singleton Stripe Client.
 * Throws a helpful error when STRIPE_SECRET_KEY is missing / still a placeholder.
 */
export function getStripeClient(): Stripe {
  if (!globalThis.__blueprintStripeClient) {
    // PLACEHOLDER resolved via getStripeSecretKey() — replace sk_test_REPLACE_ME in .env.local
    globalThis.__blueprintStripeClient = new Stripe(getStripeSecretKey());
  }
  return globalThis.__blueprintStripeClient;
}

/** Convenience alias matching the sample naming convention (`stripeClient`). */
export const stripeClient = {
  get current(): Stripe {
    return getStripeClient();
  },
};

export type { Stripe };
