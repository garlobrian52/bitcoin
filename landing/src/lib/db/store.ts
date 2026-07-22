/**
 * In-memory data store for the Stripe Connect sample.
 *
 * In production, replace this with your real database:
 *   - userId → stripeAccountId mapping
 *   - subscription status per connected account (customer_account)
 *
 * Data is lost when the server restarts.
 */

export type SubscriptionStatus = {
  /** Connected account ID (acct_...) — same as customer_account for V2 accounts */
  customerAccount: string;
  subscriptionId: string | null;
  status: string;
  priceId: string | null;
  quantity: number;
  cancelAtPeriodEnd: boolean;
  pauseCollection: boolean;
  updatedAt: string;
};

/** Demo user record — maps your app's user to a Stripe connected account ID */
export type DemoUser = {
  id: string;
  email: string;
  displayName: string;
  stripeAccountId: string;
  createdAt: string;
};

const usersById = new Map<string, DemoUser>();
const usersByEmail = new Map<string, DemoUser>();
const subscriptionsByAccount = new Map<string, SubscriptionStatus>();

/** Generate a simple demo user ID from email (not for production). */
function demoUserId(email: string): string {
  return `user_${email.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;
}

/** Store mapping from platform user → Stripe connected account ID. */
export function saveUserAccountMapping(params: {
  email: string;
  displayName: string;
  stripeAccountId: string;
}): DemoUser {
  const id = demoUserId(params.email);
  const user: DemoUser = {
    id,
    email: params.email,
    displayName: params.displayName,
    stripeAccountId: params.stripeAccountId,
    createdAt: new Date().toISOString(),
  };
  usersById.set(id, user);
  usersByEmail.set(params.email.toLowerCase(), user);
  return user;
}

export function getUserByEmail(email: string): DemoUser | undefined {
  return usersByEmail.get(email.toLowerCase());
}

export function getUserByAccountId(accountId: string): DemoUser | undefined {
  for (const user of usersById.values()) {
    if (user.stripeAccountId === accountId) return user;
  }
  return undefined;
}

/**
 * Persist subscription status from webhook events.
 * TODO: write to your database instead of this in-memory map.
 */
export function upsertSubscriptionStatus(status: SubscriptionStatus): void {
  subscriptionsByAccount.set(status.customerAccount, status);
}

export function getSubscriptionStatus(
  customerAccount: string,
): SubscriptionStatus | undefined {
  return subscriptionsByAccount.get(customerAccount);
}
