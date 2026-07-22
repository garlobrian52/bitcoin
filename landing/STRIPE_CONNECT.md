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
| `STRIPE_WEBHOOK_SECRET` | Signing secret for snapshot events (unified `/api/webhooks/stripe` endpoint) |
| `STRIPE_WEBHOOK_SECRET_THIN` | Signing secret for V2 thin events (unified `/api/webhooks/stripe` endpoint) |
| `STRIPE_THIN_WEBHOOK_SECRET` | Signing secret for dedicated `/api/webhooks/thin` endpoint |
| `STRIPE_BILLING_WEBHOOK_SECRET` | Signing secret for dedicated `/api/webhooks/billing` endpoint |
| `STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID` | Recurring `price_...` the connected account subscribes to |
| `NEXT_PUBLIC_APP_URL` | Public origin for redirects (default `http://localhost:3000`) |

Missing / `REPLACE_ME` values throw clear runtime errors.

### Platform Price

1. Dashboard → **Products** → create a recurring product (e.g. "Blueprint Pro").
2. Copy the Price id (`price_...`) into `STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID`.

## Local webhooks (Stripe CLI)

### Unified webhook endpoint (`/api/webhooks/stripe`)

Thin events (Connect V2 accounts):

```bash
stripe listen --thin-events \
  'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
  --forward-thin-to http://localhost:3000/api/webhooks/stripe
```

Billing / subscription snapshot events:

```bash
stripe listen --forward-to http://localhost:3000/api/webhooks/stripe
```

### Dedicated endpoints

Thin events → `/api/webhooks/thin`:

```bash
stripe listen --thin-events \
  'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
  --forward-thin-to localhost:3000/api/webhooks/thin
```

Billing / subscription snapshot events → `/api/webhooks/billing`:

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

## What's included

| Flow | Route | Description |
|------|-------|-------------|
| Merchant dashboard | `/connect` | Create V2 accounts, onboard, manage subscriptions |
| Product creation | `/connect/products?accountId=acct_...` | Create products on connected accounts |
| Storefront | `/storefront/[accountId]` | Customer-facing shop (one page per connected account) |
| Unified webhooks | `/api/webhooks/stripe` | Thin events (V2 accounts) + snapshot events (subscriptions) |
| Dedicated thin webhooks | `/api/webhooks/thin` | V2 connected account requirement/capability updates |
| Dedicated billing webhooks | `/api/webhooks/billing` | Subscription snapshot handlers |

## Key files

| Path | Role |
| --- | --- |
| `src/lib/stripe/client.ts` | Shared `Stripe` client singleton |
| `src/lib/stripe/config.ts` | Env validation + helpers (`requireEnv`, `getAppUrl`, etc.) |
| `src/lib/stripe/accounts.ts` | V2 account creation + onboarding status helpers |
| `src/lib/stripe.ts` | Legacy client + placeholder validation (used by billing/thin routes) |
| `src/lib/db/store.ts` | In-memory store for user ↔ account mapping |
| `src/lib/store.ts` | JSON-file store for user ↔ account + subscription status |
| `src/lib/webhooks/thin-events.ts` | Thin event handlers |
| `src/lib/webhooks/snapshot-events.ts` | Subscription snapshot handlers |
| `src/app/connect/page.tsx` | Seller dashboard UI |
| `src/app/storefront/[accountId]/page.tsx` | Customer storefront |
| `src/app/api/connect/*` | Account, onboarding, products, checkout, subscribe, portal |
| `src/app/api/webhooks/stripe/route.ts` | Unified webhook endpoint |
| `src/app/api/webhooks/thin/route.ts` | Dedicated thin event handler |
| `src/app/api/webhooks/billing/route.ts` | Dedicated billing/subscription handler |

## Notes

- All Stripe calls go through `getStripeClient()` (`new Stripe(secretKey)`).
- Connected-account requests pass `{ stripeAccount: accountId }` (Stripe-Account header).
- V2 Accounts use `customer_account: "acct_..."` for Checkout subscriptions and the Billing Portal — not classic `cus_...` ids.
- The storefront URL uses `acct_...` for the demo only; use a public store slug in production.
- Replace the in-memory/JSON store with your real database (`TODO` markers in the store files).

## Production checklist

- [ ] Replace `src/lib/db/store.ts` and `src/lib/store.ts` with your real database
- [ ] Use merchant slugs instead of `acct_...` in storefront URLs
- [ ] Set up webhook destinations in the Stripe Dashboard for production
- [ ] Create a platform subscription Price and set `STRIPE_PLATFORM_SUBSCRIPTION_PRICE_ID`
