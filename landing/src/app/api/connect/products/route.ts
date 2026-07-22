/**
 * Products on a connected account (Stripe-Account header via `stripeAccount`).
 *
 * GET  /api/connect/products?accountId=acct_...
 * POST /api/connect/products  { accountId, name, description, priceInCents, currency }
 */
import { NextRequest, NextResponse } from "next/server";
import { getStripeClient, stripeErrorMessage } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const accountId = request.nextUrl.searchParams.get("accountId")?.trim();
    if (!accountId) {
      return NextResponse.json(
        { error: "accountId query param is required." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();

    // List products that belong to the connected account.
    // The `stripeAccount` request option sets the Stripe-Account header.
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
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      accountId?: string;
      name?: string;
      description?: string;
      priceInCents?: number;
      currency?: string;
    };

    const accountId = body.accountId?.trim();
    const name = body.name?.trim();
    const description = body.description?.trim() ?? "";
    const priceInCents = Number(body.priceInCents);
    const currency = (body.currency?.trim() || "usd").toLowerCase();

    if (!accountId || !name || !Number.isFinite(priceInCents) || priceInCents < 50) {
      return NextResponse.json(
        {
          error:
            "accountId, name, and priceInCents (>= 50) are required to create a product.",
        },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();

    // Create the product + default price on the connected account.
    const product = await stripeClient.products.create(
      {
        name,
        description: description || undefined,
        default_price_data: {
          unit_amount: Math.round(priceInCents),
          currency,
        },
      },
      {
        // Use stripeAccount for the Stripe-Account header
        stripeAccount: accountId,
      },
    );

    return NextResponse.json({ product });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}
