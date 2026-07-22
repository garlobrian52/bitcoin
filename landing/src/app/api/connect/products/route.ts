import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { StripeConfigError } from "@/lib/stripe/config";

/**
 * GET  /api/connect/products?accountId=acct_...  — List products on a connected account.
 * POST /api/connect/products                      — Create a product on a connected account.
 *
 * Both routes use the Stripe-Account header via the `stripeAccount` request option.
 */

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId")?.trim();
    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "accountId query param must be a connected account ID (acct_...)." },
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
      { error: "Failed to list products on connected account." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      accountId?: string;
      name?: string;
      description?: string;
      priceInCents?: number;
      currency?: string;
    };

    const { accountId, name, description, priceInCents, currency } = body;

    if (!accountId?.startsWith("acct_")) {
      return NextResponse.json(
        { error: "accountId must be a connected account ID (acct_...)." },
        { status: 400 },
      );
    }
    if (!name?.trim()) {
      return NextResponse.json({ error: "name is required." }, { status: 400 });
    }
    if (!priceInCents || priceInCents < 50) {
      return NextResponse.json(
        { error: "priceInCents must be at least 50 (e.g. $0.50)." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();

    const product = await stripeClient.products.create(
      {
        name: name.trim(),
        description: description?.trim() || undefined,
        default_price_data: {
          unit_amount: priceInCents,
          currency: (currency ?? "usd").toLowerCase(),
        },
      },
      {
        // Passes the Stripe-Account header so the product is created on the connected account
        stripeAccount: accountId,
      },
    );

    return NextResponse.json({ product });
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product on connected account." },
      { status: 500 },
    );
  }
}
