<<<<<<< HEAD
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
=======
import { NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe/client";
import { StripeConfigError } from "@/lib/stripe/config";

/**
 * POST /api/connect/products
 *
 * Step 3 — Create a product on a connected account using the Stripe-Account header.
 * Body: { accountId, name, description, priceInCents, currency }
 */
export async function POST(request: Request) {
>>>>>>> origin/master
  try {
    const body = (await request.json()) as {
      accountId?: string;
      name?: string;
      description?: string;
      priceInCents?: number;
      currency?: string;
    };

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/master
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();

<<<<<<< HEAD
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
=======
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
>>>>>>> origin/master
        stripeAccount: accountId,
      },
    );

    return NextResponse.json({ product });
<<<<<<< HEAD
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
=======
  } catch (error) {
    if (error instanceof StripeConfigError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product on connected account." },
      { status: 500 },
    );
>>>>>>> origin/master
  }
}
