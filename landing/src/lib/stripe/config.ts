/**
 * Stripe Connect environment configuration.
 *
 * Every value below must be set in `.env.local` (see `.env.example`).
 * Missing values throw at runtime with a message pointing to the variable name.
 */

/** Thrown when a required Stripe environment variable is missing or empty. */
export class StripeConfigError extends Error {
  constructor(public readonly envVar: string) {
    super(
      `Missing required environment variable "${envVar}". ` +
        `Copy landing/.env.example to landing/.env.local and fill in your Stripe credentials. ` +
        `Get test keys from https://dashboard.stripe.com/test/apikeys`,
    );
    this.name = "StripeConfigError";
  }
}

/** Read a required env var or throw StripeConfigError. */
export function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new StripeConfigError(name);
  }
  return value;
}

/** Read an optional env var; returns undefined when unset. */
export function optionalEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

/**
 * Public base URL for redirects (onboarding return, checkout success, etc.).
 * PLACEHOLDER: set NEXT_PUBLIC_APP_URL to your deployed or local URL, e.g. http://localhost:3000
 */
export function getAppUrl(): string {
  return requireEnv("NEXT_PUBLIC_APP_URL");
}

/**
 * Platform subscription price ID for charging connected accounts.
 * PLACEHOLDER: create a recurring Price in the Stripe Dashboard and set STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID.
 */
export function getPlatformSubscriptionPriceId(): string {
  return requireEnv("STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID");
}
