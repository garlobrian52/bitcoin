# Stripe Connect sample (Accounts v2)

Sample integration inside the Blueprint Next.js app (`landing/`) that demonstrates:

1. Creating Connected Accounts with **Accounts v2** (no top-level `type`)
2. Onboarding via **V2 Account Links** + live status from the Accounts API
3. Thin webhooks for requirement / capability updates
4. Creating & listing products on the connected account (`Stripe-Account` header)
5. Customer storefront with **Direct Charges** + application fee (Hosted Checkout)
6. Platform subscriptions billed to the connected account via `customer_account`
7. Billing Portal + snapshot webhooks for subscription lifecycle

SDK: [`stripe@22.3.2`](https://github.com/stripe/stripe-node/releases) (latest stable). API version `2026-06-24.dahlia` is selected automatically by the SDK.

## Quick start

```bash
cd landing
cp .env.example .env.local
# Fill in STRIPE_SECRET_KEY, STRIPE_PRICE_ID, webhook secrets, NEXT_PUBLIC_APP_URL
npm install
npm run dev
```

Open [http://localhost:3000/connect](http://localhost:3000/connect).

## Environment variables

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Platform secret key (`sk_test_...`) |
| `NEXT_PUBLIC_APP_URL` | Public origin for redirects (`http://localhost:3000`) |
| `STRIPE_PRICE_ID` | Recurring Price id for the platform SaaS plan (`price_...`) |
| `STRIPE_THIN_WEBHOOK_SECRET` | Signing secret for thin (V2 Accounts) events |
| `STRIPE_WEBHOOK_SECRET` | Signing secret for snapshot subscription events |

Every missing / `REPLACE_ME` value throws a clear error from `src/lib/env.ts`.

## Local webhook forwarding

### Thin events (Accounts v2)

```bash
stripe listen \
  --thin-events 'v2.core.account[requirements].updated,v2.core.account[configuration.recipient].capability_status_updated,v2.core.account[configuration.merchant].capability_status_updated,v2.core.account[configuration.customer].capability_status_updated' \
  --forward-thin-to localhost:3000/api/webhooks/thin
```

Paste the printed `whsec_...` into `STRIPE_THIN_WEBHOOK_SECRET`.

Dashboard alternative: Developers → Webhooks → Add destination → Connected accounts → advanced options → Payload style **Thin** → select the v2 event types above.

### Snapshot events (subscriptions)

```bash
stripe listen \
  --forward-to localhost:3000/api/webhooks/stripe \
  --events customer.subscription.updated,customer.subscription.deleted,payment_method.attached,payment_method.detached,customer.updated,customer.tax_id.created,customer.tax_id.deleted,customer.tax_id.updated,billing_portal.configuration.created,billing_portal.configuration.updated,billing_portal.session.created
```

Paste that `whsec_...` into `STRIPE_WEBHOOK_SECRET`.

## Key files

| Path | Role |
| --- | --- |
| `src/lib/stripe.ts` | Shared `stripeClient` (`new Stripe(secretKey)`) |
| `src/lib/store.ts` | In-memory user ↔ account mapping + subscription status (TODO → real DB) |
| `src/app/api/connect/**` | Account, onboarding, products, checkout, subscription, portal APIs |
| `src/app/api/webhooks/thin/route.ts` | Thin Event Notification handlers |
| `src/app/api/webhooks/stripe/route.ts` | Snapshot subscription / billing handlers |
| `src/app/connect/dashboard/page.tsx` | Merchant UI |
| `src/app/connect/store/[accountId]/page.tsx` | Customer storefront |

## Notes

- All Stripe calls go through `getStripeClient()` / `stripeClient`.
- Onboarding status is **always** read from `v2.core.accounts.retrieve` — never from the local store.
- For V2 accounts, use `customer_account` (`acct_...`), not classic `customer` (`cus_...`).
- `parseThinEvent` was renamed to `parseEventNotification` in stripe-node v22; the thin webhook uses the new name and documents the rename.
- Storefront URLs use `acct_...` for the demo only — replace with a public store slug before production.
