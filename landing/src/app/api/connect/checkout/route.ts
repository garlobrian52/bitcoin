/**
 * POST /api/connect/checkout
 *
 * Direct Charge Checkout Session on a connected account, with an application fee
 * so the platform monetizes the transaction.
 */
import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAppUrl } from "@/lib/app-url";
import { getStripeClient, stripeErrorMessage } from "@/lib/stripe";

export const runtime = "nodejs";

/** Sample platform take rate — 10% of the unit amount (minimum $0.50). */
function applicationFeeAmount(unitAmount: number): number {
  return Math.max(50, Math.round(unitAmount * 0.1));
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      accountId?: string;
      productId?: string;
      quantity?: number;
    };

    const accountId = body.accountId?.trim();
    const productId = body.productId?.trim();
    const quantity = Math.max(1, Number(body.quantity) || 1);

    if (!accountId || !productId) {
      return NextResponse.json(
        { error: "accountId and productId are required." },
        { status: 400 },
      );
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();

    // Retrieve the product (and its default price) from the connected account.
    const product = await stripeClient.products.retrieve(
      productId,
      { expand: ["default_price"] },
      { stripeAccount: accountId },
    );

    const defaultPrice = product.default_price;
    if (!defaultPrice || typeof defaultPrice === "string") {
      return NextResponse.json(
        { error: "Product is missing an expanded default_price; cannot start checkout." },
        { status: 400 },
      );
    }

    const price = defaultPrice as Stripe.Price;
    if (!price.unit_amount) {
      return NextResponse.json(
        { error: "Product price has no unit_amount (unsupported pricing model for this demo)." },
        { status: 400 },
      );
    }

    // Hosted Checkout — Direct Charge on the connected account.
    const session = await stripeClient.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            // Prefer the existing Price on the connected account.
            price: price.id,
            quantity,
          },
        ],
        payment_intent_data: {
          // Sample application fee — platform revenue on each Direct Charge.
          application_fee_amount: applicationFeeAmount(price.unit_amount) * quantity,
        },
        success_url: `${appUrl}/store/${accountId}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}/store/${accountId}`,
      },
      {
        // Connected account header — funds settle on the seller's account.
        stripeAccount: accountId,
      },
    );

    if (!session.url) {
      return NextResponse.json(
        { error: "Checkout Session was created without a hosted URL." },
        { status: 500 },
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    return NextResponse.json({ error: stripeErrorMessage(err) }, { status: 500 });
  }
}
