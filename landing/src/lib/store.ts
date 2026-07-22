/**
 * Demo persistence for the Stripe Connect sample.
 *
 * There is no production database in this repo yet, so we keep mappings in
 * memory (plus optional JSON file under /tmp for local restarts).
 *
 * TODO(database): Replace every function below with real DB reads/writes
 * (e.g. Prisma / Drizzle / Postgres). Suggested tables:
 *   - users (id, email, display_name, stripe_account_id, subscription_status, ...)
 *   - subscriptions (user_id, stripe_subscription_id, status, price_id, ...)
 */

import { promises as fs } from "fs";
import path from "path";

export type SubscriptionStatus =
  | "none"
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "paused"
  | "unpaid"
  | "incomplete";

export type DemoUser = {
  /** Local demo user id (not a Stripe id). */
  id: string;
  email: string;
  displayName: string;
  /** Connected Account id (`acct_...`) from Accounts v2. */
  stripeAccountId: string | null;
  /**
   * Platform subscription status for this connected account.
   * Updated from snapshot webhooks (customer.subscription.*).
   * For V2 accounts the Stripe customer reference is `customer_account` (= acct_...).
   */
  subscriptionStatus: SubscriptionStatus;
  /** Stripe Subscription id when subscribed, else null. */
  stripeSubscriptionId: string | null;
  createdAt: string;
};

type StoreShape = {
  users: DemoUser[];
};

const STORE_PATH = path.join("/tmp", "blueprint-stripe-connect-store.json");

declare global {
  var __blueprintConnectStore: StoreShape | undefined;
}

function emptyStore(): StoreShape {
  return { users: [] };
}

async function readStore(): Promise<StoreShape> {
  if (globalThis.__blueprintConnectStore) {
    return globalThis.__blueprintConnectStore;
  }
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    globalThis.__blueprintConnectStore = JSON.parse(raw) as StoreShape;
  } catch {
    globalThis.__blueprintConnectStore = emptyStore();
  }
  return globalThis.__blueprintConnectStore;
}

async function writeStore(store: StoreShape): Promise<void> {
  globalThis.__blueprintConnectStore = store;
  // Best-effort persistence across local restarts; ignore failures in serverless.
  try {
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // TODO(database): persistence belongs in a real DB — file write is demo-only.
  }
}

function newUserId(): string {
  return `user_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/** List all demo users (merchant dashboard overview). */
export async function listUsers(): Promise<DemoUser[]> {
  const store = await readStore();
  return store.users;
}

/** Look up a demo user by local id. */
export async function getUserById(userId: string): Promise<DemoUser | null> {
  const store = await readStore();
  return store.users.find((u) => u.id === userId) ?? null;
}

/** Look up a demo user by their connected Stripe Account id. */
export async function getUserByStripeAccountId(
  stripeAccountId: string,
): Promise<DemoUser | null> {
  const store = await readStore();
  return store.users.find((u) => u.stripeAccountId === stripeAccountId) ?? null;
}

/**
 * Create a local demo user and (optionally) attach a Stripe Account id.
 * TODO(database): INSERT INTO users (...)
 */
export async function createUser(input: {
  email: string;
  displayName: string;
  stripeAccountId?: string | null;
}): Promise<DemoUser> {
  const store = await readStore();
  const user: DemoUser = {
    id: newUserId(),
    email: input.email,
    displayName: input.displayName,
    stripeAccountId: input.stripeAccountId ?? null,
    subscriptionStatus: "none",
    stripeSubscriptionId: null,
    createdAt: new Date().toISOString(),
  };
  store.users.push(user);
  await writeStore(store);
  return user;
}

/**
 * Persist the mapping from local user → Stripe connected account id.
 * TODO(database): UPDATE users SET stripe_account_id = $1 WHERE id = $2
 */
export async function setUserStripeAccountId(
  userId: string,
  stripeAccountId: string,
): Promise<DemoUser> {
  const store = await readStore();
  const user = store.users.find((u) => u.id === userId);
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  user.stripeAccountId = stripeAccountId;
  await writeStore(store);
  return user;
}

/**
 * Update platform subscription status for a connected account.
 * Prefer looking up by `customer_account` (acct_...) — not classic `customer` cus_ ids.
 * TODO(database): UPDATE users SET subscription_status = $1, stripe_subscription_id = $2 WHERE stripe_account_id = $3
 */
export async function upsertSubscriptionForAccount(input: {
  stripeAccountId: string;
  subscriptionStatus: SubscriptionStatus;
  stripeSubscriptionId: string | null;
}): Promise<void> {
  const store = await readStore();
  let user = store.users.find((u) => u.stripeAccountId === input.stripeAccountId);
  if (!user) {
    // TODO(database): Optionally create a row, or ignore unknown accounts.
    user = {
      id: newUserId(),
      email: `${input.stripeAccountId}@unknown.local`,
      displayName: "Unknown connected account",
      stripeAccountId: input.stripeAccountId,
      subscriptionStatus: input.subscriptionStatus,
      stripeSubscriptionId: input.stripeSubscriptionId,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
  } else {
    user.subscriptionStatus = input.subscriptionStatus;
    user.stripeSubscriptionId = input.stripeSubscriptionId;
  }
  await writeStore(store);
}

/** Map a Stripe Subscription.status string onto our demo enum. */
export function mapStripeSubscriptionStatus(
  status: string | null | undefined,
): SubscriptionStatus {
  switch (status) {
    case "active":
    case "trialing":
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
      return status;
    case "paused":
      return "paused";
    default:
      return "none";
  }
}
