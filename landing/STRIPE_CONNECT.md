<<<<<<< HEAD
# Stripe Connect sample (Blueprint)

Sample Stripe Connect integration for the Blueprint Next.js app. It covers:

1. Creating **V2 connected accounts**
2. **Account Link** onboarding + live status from the Accounts API
3. **Thin webhooks** for requirement / capability updates
4. Creating & listing **products** on the connected account
5. A **storefront** with Direct Charge Checkout + application fee
6. **Platform subscriptions** billed to the connected account (`customer_account`) + Billing Portal
7. **Billing webhooks** (snapshot events) that sync subscription status

Uses **`stripe@22.3.2`** (latest stable at time of writing). The SDK selects the API version automatically (`2026-06-24.dahlia` / bundled Dahlia).

## Setup

```bash
cd landing
cp .env.example .env.local
# Fill in STRIPE_SECRET_KEY and the other placeholders
npm install
npm run dev
```

Open [http://localhost:3000/connect](http://localhost:3000/connect).

### Environment placeholders

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Secret API key (`sk_test_...`) |
| `STRIPE_THIN_WEBHOOK_SECRET` | Signing secret for V2 thin events |
| `STRIPE_BILLING_WEBHOOK_SECRET` | Signing secret for subscription snapshot events |
| `STRIPE_PLATFORM_PRICE_ID` | Recurring `price_...` the connected account subscribes to |
| `NEXT_PUBLIC_APP_URL` | Public origin for redirects (default `http://localhost:3000`) |

Missing / `REPLACE_ME` values throw clear runtime errors from `src/lib/stripe.ts`.

### Platform Price

1. Dashboard → **Products** → create a recurring product (e.g. “Blueprint Pro”).
2. Copy the Price id (`price_...`) into `STRIPE_PLATFORM_PRICE_ID`.

## Local webhooks (Stripe CLI)

Thin events (Connect V2 accounts):

```bash
stripe listen --thin-events \
  'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
  --forward-thin-to localhost:3000/api/webhooks/thin
```

Billing / subscription snapshot events:

```bash
stripe listen --events \
  customer.subscription.updated,customer.subscription.deleted,payment_method.attached,payment_method.detached,customer.updated,customer.tax_id.created,customer.tax_id.deleted,customer.tax_id.updated,billing_portal.configuration.created,billing_portal.configuration.updated,billing_portal.session.created \
  --forward-to localhost:3000/api/webhooks/billing
```

Paste the printed `whsec_...` values into `.env.local`.

### Dashboard thin destination

1. Developers → Webhooks → **+ Add destination**
2. Events from: **Connected accounts**
3. Show advanced options → Payload style: **Thin**
4. Select the `v2.core.account[...]` event types above

## Key files

| Path | Role |
| --- | --- |
| `src/lib/stripe.ts` | Shared `Stripe` client + placeholder validation |
| `src/lib/store.ts` | Demo JSON store for user ↔ account + subscription status |
| `src/app/connect/page.tsx` | Seller dashboard UI |
| `src/app/store/[accountId]/page.tsx` | Customer storefront |
| `src/app/api/connect/*` | Account, onboarding, products, checkout, subscribe, portal |
| `src/app/api/webhooks/thin/route.ts` | Thin event handlers |
| `src/app/api/webhooks/billing/route.ts` | Subscription snapshot handlers |

## Notes

- All Stripe calls go through `getStripeClient()` (`new Stripe(secretKey)`).
- Connected-account requests pass `{ stripeAccount: accountId }` (Stripe-Account header).
- V2 Accounts use `customer_account: "acct_..."` for Checkout subscriptions and the Billing Portal — not classic `cus_...` ids.
- The storefront URL uses `acct_...` for the demo only; use a public store slug in production.
- Replace `.data/connect-store.json` with your real database (`TODO` markers are in `src/lib/store.ts` and the webhook handlers).
=======
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
>>>>>>> origin/master
