/**
 * POST /api/connect/checkout
 *
 * Start a Hosted Checkout Session as a Direct Charge on the connected account,
 * with an application fee so the platform monetizes the sale.
 *
 * Docs: https://docs.stripe.com/connect/charges#direct-charges
 */
import { getAppUrl } from "@/lib/env";
import { getStripeClient } from "@/lib/stripe";
import { errorMessage, jsonError, jsonOk } from "@/lib/http";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      accountId?: string;
      productId?: string;
      quantity?: number;
    };

    const accountId = body.accountId?.trim();
    const productId = body.productId?.trim();
    const quantity = Math.max(1, Number(body.quantity) || 1);

    if (!accountId?.startsWith("acct_")) {
      return jsonError("accountId (acct_...) is required");
    }
    if (!productId?.startsWith("prod_")) {
      return jsonError("productId (prod_...) is required");
    }

    const stripeClient = getStripeClient();
    const appUrl = getAppUrl();

    // Load the product (and its default price) from the connected account.
    const product = await stripeClient.products.retrieve(
      productId,
      { expand: ["default_price"] },
      { stripeAccount: accountId },
    );

    const defaultPrice = product.default_price;
    if (!defaultPrice || typeof defaultPrice === "string") {
      return jsonError("Product is missing an expanded default_price");
    }
    if (!defaultPrice.unit_amount || !defaultPrice.currency) {
      return jsonError("default_price is missing unit_amount or currency");
    }

    const unitAmount = defaultPrice.unit_amount;
    // Sample application fee: 10% of the line total (minimum $0.50 / 50 cents).
    const applicationFeeAmount = Math.max(50, Math.round(unitAmount * quantity * 0.1));

    // Hosted Checkout as a Direct Charge — payment settles on the connected account,
    // platform takes application_fee_amount.
    const session = await stripeClient.checkout.sessions.create(
      {
        mode: "payment",
        line_items: [
          {
            quantity,
            price_data: {
              currency: defaultPrice.currency,
              unit_amount: unitAmount,
              product_data: {
                name: product.name,
                description: product.description ?? undefined,
              },
            },
          },
        ],
        payment_intent_data: {
          // Sample Application Fee collected by the platform.
          application_fee_amount: applicationFeeAmount,
        },
        success_url: `${appUrl}/connect/success?session_id={CHECKOUT_SESSION_ID}&accountId=${accountId}`,
        cancel_url: `${appUrl}/connect/store/${accountId}`,
      },
      {
        // Stripe-Account header → Direct Charge on the connected account.
        stripeAccount: accountId,
      },
    );

    if (!session.url) {
      return jsonError("Checkout Session was created without a redirect URL", 500);
    }

    return jsonOk({
      url: session.url,
      sessionId: session.id,
      applicationFeeAmount,
    });
  } catch (err) {
    return jsonError(errorMessage(err), 500);
  }
}
