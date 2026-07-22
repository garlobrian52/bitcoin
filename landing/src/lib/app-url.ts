/**
 * Resolves the public base URL for Account Links, Checkout, and the Billing Portal.
 * PLACEHOLDER: set NEXT_PUBLIC_APP_URL in `.env.local` (defaults to http://localhost:3000).
 */
export function getAppUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (!url || url.includes("REPLACE_ME")) {
    // Local-dev fallback so the UI still works before env is fully configured.
    return "http://localhost:3000";
  }
  return url;
}
