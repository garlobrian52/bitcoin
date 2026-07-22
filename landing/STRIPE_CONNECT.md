# Stripe Connect Sample Integration

A complete Stripe Connect sample built into the Blueprint Next.js landing app. It demonstrates V2 connected accounts, onboarding, product creation, a customer storefront, direct charges with application fees, and platform subscriptions.

## Quick start

1. Copy environment variables:

   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Stripe test keys in `.env.local` (see placeholders in the file).

3. Install dependencies and run:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000/connect](http://localhost:3000/connect).

## What's included

| Flow | Route | Description |
|------|-------|-------------|
| Merchant dashboard | `/connect` | Create V2 accounts, onboard, manage subscriptions |
| Product creation | `/connect/products?accountId=acct_...` | Create products on connected accounts |
| Storefront | `/storefront/[accountId]` | Customer-facing shop (one page per connected account) |
| Webhooks | `/api/webhooks/stripe` | Thin events (V2 accounts) + snapshot events (subscriptions) |

## Key implementation details

- **Stripe Client**: All requests use `getStripeClient()` (`new Stripe(secretKey)`).
- **V2 Accounts**: Created via `stripeClient.v2.core.accounts.create()` — no top-level `type` field.
- **Onboarding**: V2 Account Links via `stripeClient.v2.core.accountLinks.create()`.
- **Status**: Always fetched live from the Accounts API (not stored in DB).
- **Products**: Created with `stripeAccount` header on connected accounts.
- **Checkout**: Direct Charge with `application_fee_amount` via hosted Checkout.
- **Subscriptions**: `customer_account` (acct_...) for V2 accounts + Billing Portal.

## Webhook setup

### Thin events (connected account requirements)

```bash
stripe listen --thin-events \
  'v2.core.account[requirements].updated,v2.core.account[.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
  --forward-thin-to http://localhost:3000/api/webhooks/stripe
```

### Snapshot events (subscriptions)

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

## File structure

```
src/
  lib/
    stripe/          # Client, config, account helpers
    db/store.ts      # In-memory user→account mapping (replace with your DB)
    webhooks/        # Thin + snapshot event handlers
  app/
    api/connect/     # Account, product, subscription, billing APIs
    api/storefront/  # Product listing + checkout
    api/webhooks/    # Unified webhook endpoint
    connect/         # Merchant UI pages
    storefront/      # Customer storefront
  components/connect/ # Shared UI components
```

## Production checklist

- [ ] Replace in-memory store (`src/lib/db/store.ts`) with your database
- [ ] Use merchant slugs instead of `acct_...` in storefront URLs
- [ ] Set up webhook destinations in the Stripe Dashboard for production
- [ ] Create a platform subscription Price and set `STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID`
