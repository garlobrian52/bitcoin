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
