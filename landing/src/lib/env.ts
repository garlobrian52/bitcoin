/**
 * Environment helpers for the Stripe Connect sample.
 *
 * Every secret is validated at call time so missing placeholders surface a
 * helpful error instead of a cryptic Stripe API failure.
 */

function missingEnvError(name: string, hint: string): Error {
  return new Error(
    `Missing required environment variable: ${name}. ${hint} ` +
      `Copy landing/.env.example to landing/.env.local and replace the PLACEHOLDER values.`,
  );
}

/** Base URL for redirects (Account Links, Checkout, Billing Portal). */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!url || url.includes("REPLACE_ME")) {
    throw missingEnvError(
      "NEXT_PUBLIC_APP_URL",
      "Set it to your public origin, e.g. http://localhost:3000.",
    );
  }
  return url.replace(/\/$/, "");
}

/**
 * Platform secret key used to construct the Stripe Client.
 * PLACEHOLDER: set STRIPE_SECRET_KEY in .env.local
 */
export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || key.includes("REPLACE_ME") || key === "sk_***") {
    throw missingEnvError(
      "STRIPE_SECRET_KEY",
      "Get a secret key from https://dashboard.stripe.com/apikeys (use a test key while developing).",
    );
  }
  return key;
}

/**
 * Recurring Price ID for the platform SaaS plan charged to connected accounts.
 * PLACEHOLDER: set STRIPE_PRICE_ID in .env.local after creating a Price in Dashboard.
 */
export function getPlatformPriceId(): string {
  const priceId = process.env.STRIPE_PRICE_ID?.trim();
  if (!priceId || priceId.includes("REPLACE_ME") || !priceId.startsWith("price_")) {
    throw missingEnvError(
      "STRIPE_PRICE_ID",
      "Create a recurring Price in the Stripe Dashboard (Product catalog) and paste its price_... ID. " +
        "If you do not have one yet, leave a TODO and use a placeholder like price_REPLACE_ME until configured.",
    );
  }
  return priceId;
}

/** Signing secret for thin (V2 Accounts) webhook destination. */
export function getThinWebhookSecret(): string {
  const secret = process.env.STRIPE_THIN_WEBHOOK_SECRET?.trim();
  if (!secret || secret.includes("REPLACE_ME")) {
    throw missingEnvError(
      "STRIPE_THIN_WEBHOOK_SECRET",
      "Run `stripe listen --thin-events '...' --forward-thin-to localhost:3000/api/webhooks/thin` and paste the whsec_... value.",
    );
  }
  return secret;
}

/** Signing secret for snapshot (v1 subscription/billing) webhooks. */
export function getSnapshotWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!secret || secret.includes("REPLACE_ME")) {
    throw missingEnvError(
      "STRIPE_WEBHOOK_SECRET",
      "Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and paste the whsec_... value.",
    );
  }
  return secret;
}
