/**
 * Lightweight JSON-file store for the Connect demo.
 *
 * There is no production database in this sample app, so we persist:
 *   - userId → Stripe connected account ID
 *   - connected account subscription status (updated by Billing webhooks)
 *
 * TODO: Replace this file store with your real database (Postgres, Prisma, etc.).
 *       Persist the same fields on your User / Account models.
 */
import { promises as fs } from "fs";
import path from "path";

export type SubscriptionStatus =
  | "none"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "paused"
  | "incomplete"
  | "incomplete_expired";

export type ConnectedUserRecord = {
  /** Demo "user" id (email or free-form string from the dashboard form). */
  userId: string;
  /** Stripe V2 Account id (acct_...). */
  stripeAccountId: string;
  displayName: string;
  contactEmail: string;
  createdAt: string;
  /**
   * Platform subscription status for this connected account
   * (they are billed as a customer_account on the platform).
   */
  subscriptionStatus: SubscriptionStatus;
  /** Stripe Subscription id when known (sub_...). */
  subscriptionId?: string;
  updatedAt: string;
};

type StoreShape = {
  users: ConnectedUserRecord[];
};

const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_PATH = path.join(DATA_DIR, "connect-store.json");

async function ensureStore(): Promise<StoreShape> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as StoreShape;
  } catch {
    const empty: StoreShape = { users: [] };
    await fs.writeFile(STORE_PATH, JSON.stringify(empty, null, 2));
    return empty;
  }
}

async function writeStore(store: StoreShape): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2));
}

/** Look up the connected account mapping for a local user. */
export async function getUserById(userId: string): Promise<ConnectedUserRecord | null> {
  const store = await ensureStore();
  return store.users.find((u) => u.userId === userId) ?? null;
}

/** Look up a user by their Stripe connected account id. */
export async function getUserByAccountId(
  stripeAccountId: string,
): Promise<ConnectedUserRecord | null> {
  const store = await ensureStore();
  return store.users.find((u) => u.stripeAccountId === stripeAccountId) ?? null;
}

/** Persist a new user ↔ Stripe Account mapping after V2 account creation. */
export async function saveConnectedAccount(input: {
  userId: string;
  stripeAccountId: string;
  displayName: string;
  contactEmail: string;
}): Promise<ConnectedUserRecord> {
  const store = await ensureStore();
  const existing = store.users.findIndex((u) => u.userId === input.userId);
  const now = new Date().toISOString();
  const record: ConnectedUserRecord = {
    userId: input.userId,
    stripeAccountId: input.stripeAccountId,
    displayName: input.displayName,
    contactEmail: input.contactEmail,
    createdAt: existing >= 0 ? store.users[existing].createdAt : now,
    subscriptionStatus: existing >= 0 ? store.users[existing].subscriptionStatus : "none",
    subscriptionId: existing >= 0 ? store.users[existing].subscriptionId : undefined,
    updatedAt: now,
  };

  if (existing >= 0) {
    store.users[existing] = record;
  } else {
    store.users.push(record);
  }

  // TODO: DB write — INSERT/UPDATE users SET stripe_account_id = $1 WHERE id = $2
  await writeStore(store);
  return record;
}

/**
 * Update subscription status for a connected account (customer_account).
 * Called from Billing webhook handlers.
 */
export async function updateSubscriptionStatus(input: {
  stripeAccountId: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionId?: string;
}): Promise<ConnectedUserRecord | null> {
  const store = await ensureStore();
  const idx = store.users.findIndex((u) => u.stripeAccountId === input.stripeAccountId);
  if (idx < 0) {
    // TODO: DB write — if the account is unknown, create or log for reconciliation.
    console.warn(
      `[store] No local user for account ${input.stripeAccountId}; skipping subscription update.`,
    );
    return null;
  }

  store.users[idx] = {
    ...store.users[idx],
    subscriptionStatus: input.subscriptionStatus,
    subscriptionId: input.subscriptionId ?? store.users[idx].subscriptionId,
    updatedAt: new Date().toISOString(),
  };

  // TODO: DB write — UPDATE users SET subscription_status = $1, subscription_id = $2 WHERE stripe_account_id = $3
  await writeStore(store);
  return store.users[idx];
}

export async function listUsers(): Promise<ConnectedUserRecord[]> {
  const store = await ensureStore();
  return store.users;
}
