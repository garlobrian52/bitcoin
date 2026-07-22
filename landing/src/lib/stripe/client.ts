import Stripe from "stripe";
import { requireEnv } from "./config";

/**
 * Singleton Stripe Client used for every Stripe API request in this sample.
 *
 * In stripe-node the class is `Stripe` (equivalent to StripeClient in other SDKs):
 *   const stripeClient = new Stripe('sk_test_...');
 *
 * The API version (2026-06-24.dahlia) is pinned automatically by the SDK — do not set it manually.
 */
let stripeClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    // PLACEHOLDER: set STRIPE_SECRET_KEY to your platform secret key (sk_test_... or sk_live_...)
    const secretKey = requireEnv("STRIPE_SECRET_KEY");
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}
