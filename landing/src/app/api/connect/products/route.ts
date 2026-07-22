/**
 * POST /api/connect/products
 *   Create a Product (+ default Price) on a Connected Account.
 *
 * GET  /api/connect/products?accountId=acct_...
 *   List active products on a Connected Account (for the storefront).
 *
 * Both calls pass `stripeAccount` so the SDK sends the Stripe-Account header.
 * See https://docs.stripe.com/connect/authentication
 */
import { getStripeClient } from "@/lib/stripe";
import { errorMessage, jsonError, jsonOk } from "@/lib/http";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountId = searchParams.get("accountId")?.trim();
    if (!accountId?.startsWith("acct_")) {
      return jsonError("Query param accountId (acct_...) is required");
    }

    const stripeClient = getStripeClient();

    // Expand default_price so the storefront can show unit_amount / currency.
    const products = await stripeClient.products.list(
      {
        limit: 20,
        active: true,
        expand: ["data.default_price"],
      },
      {
        // Stripe-Account header → operate on the connected account's catalog.
        stripeAccount: accountId,
      },
    );

    return jsonOk({ products: products.data });
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      accountId?: string;
      name?: string;
      description?: string;
      /** Price in the smallest currency unit (e.g. cents for USD). */
      priceInCents?: number;
      currency?: string;
    };

    const accountId = body.accountId?.trim();
    const name = body.name?.trim();
    const description = body.description?.trim() || undefined;
    const priceInCents = Number(body.priceInCents);
    const currency = (body.currency?.trim() || "usd").toLowerCase();

    if (!accountId?.startsWith("acct_")) {
      return jsonError("accountId (acct_...) is required");
    }
    if (!name) {
      return jsonError("name is required");
    }
    if (!Number.isFinite(priceInCents) || priceInCents < 1) {
      return jsonError("priceInCents must be a positive integer (e.g. 1999 for $19.99)");
    }

    const stripeClient = getStripeClient();

    // Create the product ON the connected account (Direct charges catalog).
    const product = await stripeClient.products.create(
      {
        name,
        description,
        default_price_data: {
          unit_amount: Math.round(priceInCents),
          currency,
        },
      },
      {
        stripeAccount: accountId,
      },
    );

    return jsonOk({ product }, 201);
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}
