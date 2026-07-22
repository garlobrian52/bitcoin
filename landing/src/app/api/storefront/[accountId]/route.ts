import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { StripeConfigError, getAppUrl } from "@/lib/stripe/config";

type RouteContext = { params: Promise<{ accountId: string }> };

/**
 * GET /api/storefront/:accountId/products
 *
 * List active products for a connected account storefront.
 * Uses the Stripe-Account header via stripeAccount option.
 */
export async function GET(_request: Request, context: RouteContext) {
  try {
    const { accountId } = await context.params;

    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "Invalid account ID." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();

    const products = await stripeClient.products.list(
      {
        limit: 20,
        active: true,
        expand: ["data.default_price"],
      },
      {
        stripeAccount: accountId,
      },
    );

    return NextResponse.json({ products: products.data });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to list products:", error);
    return NextResponse.json(
      { error: "Failed to list products." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/storefront/:accountId/checkout
 *
 * Step 4 — Create a hosted Checkout session (Direct Charge) with an application fee.
 * Body: { productName, unitAmount, currency, quantity? }
 */
export async function POST(request: Request, context: RouteContext) {
  try {
    const { accountId } = await context.params;
    const body = (await request.json()) as {
      productName?: string;
      unitAmount?: number;
      currency?: string;
      quantity?: number;
    };

    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "Invalid account ID." },
        { status: 400 },
      );
    }

    const { productName, unitAmount, currency, quantity = 1 } = body;

    if (!productName || !unitAmount) {
      return NextResponse.json(
        { error: "productName and unitAmount are required." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();

    const session = await stripeClient.checkout.sessions.create(
      {
        line_items: [
          {
            price_data: {
              currency: (currency ?? "usd").toLowerCase(),
              product_data: { name: productName },
              unit_amount: unitAmount,
            },
            quantity,
          },
        ],
        payment_intent_data: {
          // Platform application fee (in cents) — monetize each transaction
          application_fee_amount: 123,
        },
        mode: "payment",
        success_url: `${appUrl}/connect/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/storefront/${accountId}`,
      },
      {
        stripeAccount: accountId,
      },
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 },
    );
  }
}
