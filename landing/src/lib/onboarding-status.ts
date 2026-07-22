/**
 * Derive onboarding / payments readiness from a live Accounts v2 retrieve.
 *
 * Important: for this demo we ALWAYS read status from the Stripe API —
 * we do not cache onboarding flags in the local store.
 */
import type Stripe from "stripe";

export type AccountOnboardingStatus = {
  accountId: string;
  displayName: string | null;
  contactEmail: string | null;
  /** True when card_payments capability is active on the merchant configuration. */
  readyToProcessPayments: boolean;
  /** True when requirements are not currently_due / past_due. */
  onboardingComplete: boolean;
  requirementsStatus: string | null;
  cardPaymentsStatus: string | null;
};

export function deriveOnboardingStatus(
  account: Stripe.V2.Core.Account,
): AccountOnboardingStatus {
  const cardPaymentsStatus =
    account.configuration?.merchant?.capabilities?.card_payments?.status ?? null;

  const readyToProcessPayments = cardPaymentsStatus === "active";

  // requirements.summary.minimum_deadline.status reflects the most urgent bucket.
  const requirementsStatus =
    account.requirements?.summary?.minimum_deadline?.status ?? null;

  const onboardingComplete =
    requirementsStatus !== "currently_due" && requirementsStatus !== "past_due";

  return {
    accountId: account.id,
    displayName: account.display_name ?? null,
    contactEmail: account.contact_email ?? null,
    readyToProcessPayments,
    onboardingComplete,
    requirementsStatus,
    cardPaymentsStatus,
  };
}
