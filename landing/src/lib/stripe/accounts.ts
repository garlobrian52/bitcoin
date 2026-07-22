import type Stripe from "stripe";
import { getStripeClient } from "./client";
import { getAppUrl } from "./config";

/** Onboarding status derived live from the Stripe Accounts API (never cached in this demo). */
export type AccountOnboardingStatus = {
  accountId: string;
  displayName: string | null;
  contactEmail: string | null;
  readyToProcessPayments: boolean;
  onboardingComplete: boolean;
  cardPaymentsStatus: string | null;
  requirementsStatus: string | null;
};

/**
 * Create a V2 connected account for a platform user.
 *
 * Uses only the properties required for Connect onboarding — no top-level `type` field.
 * See: https://docs.stripe.com/api/v2/core/accounts/object
 */
export async function createConnectedAccount(params: {
  displayName: string;
  contactEmail: string;
}): Promise<Stripe.V2.Core.Account> {
  const stripeClient = getStripeClient();

  const account = await stripeClient.v2.core.accounts.create({
    display_name: params.displayName,
    contact_email: params.contactEmail,
    identity: {
      country: "us",
    },
    dashboard: "full",
    defaults: {
      responsibilities: {
        fees_collector: "stripe",
        losses_collector: "stripe",
      },
    },
    configuration: {
      customer: {},
      merchant: {
        capabilities: {
          card_payments: {
            requested: true,
          },
        },
      },
    },
  });

  return account;
}

/**
 * Fetch onboarding status directly from Stripe (demo requirement: do not store in DB).
 */
export async function getAccountOnboardingStatus(
  stripeAccountId: string,
): Promise<AccountOnboardingStatus> {
  const stripeClient = getStripeClient();

  const account = await stripeClient.v2.core.accounts.retrieve(stripeAccountId, {
    include: ["configuration.merchant", "requirements"],
  });

  const readyToProcessPayments =
    account?.configuration?.merchant?.capabilities?.card_payments?.status ===
    "active";

  const requirementsStatus =
    account.requirements?.summary?.minimum_deadline?.status ?? null;

  const onboardingComplete =
    requirementsStatus !== "currently_due" &&
    requirementsStatus !== "past_due";

  return {
    accountId: account.id,
    displayName: account.display_name ?? null,
    contactEmail: account.contact_email ?? null,
    readyToProcessPayments,
    onboardingComplete,
    cardPaymentsStatus:
      account.configuration?.merchant?.capabilities?.card_payments?.status ??
      null,
    requirementsStatus,
  };
}

/**
 * Create a V2 Account Link so the connected account can complete Stripe-hosted onboarding.
 */
export async function createAccountOnboardingLink(
  accountId: string,
): Promise<Stripe.V2.Core.AccountLink> {
  const stripeClient = getStripeClient();
  const appUrl = getAppUrl();

  const accountLink = await stripeClient.v2.core.accountLinks.create({
    account: accountId,
    use_case: {
      type: "account_onboarding",
      account_onboarding: {
        configurations: ["merchant", "customer"],
        // Stripe redirects here if the link expires before onboarding finishes
        refresh_url: `${appUrl}/connect?accountId=${accountId}`,
        // Stripe redirects here after onboarding completes or is dismissed
        return_url: `${appUrl}/connect?accountId=${accountId}`,
      },
    },
  });

  return accountLink;
}
