import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getStripe } from "./stripe";
import { getSession } from "./session";
import { FREE_STATE, toBillingState, type BillingState, type SubscriptionLike } from "./subscription";

export const billingTag = (customerId: string) => `billing:${customerId}`;

/**
 * The Stripe customer for the signed-in user. The id lives in the encrypted
 * session cookie; a GitHub user on a new device is found by metadata search.
 */
export async function findCustomerId(): Promise<string | null> {
  const stripe = getStripe();
  const session = await getSession();
  if (!stripe || !session.user) return null;
  if (session.stripeCustomerId) return session.stripeCustomerId;
  if (session.user.provider !== "github") return null;

  const result = await stripe.customers.search({
    query: `metadata['userId']:'${session.user.id.replace(/'/g, "")}'`,
    limit: 1,
  });
  return result.data[0]?.id ?? null;
}

/** Cached per customer; the Stripe webhook and checkout return expire the tag. */
async function getBillingStateForCustomer(customerId: string): Promise<BillingState> {
  "use cache";
  cacheTag(billingTag(customerId));
  cacheLife("minutes");

  const stripe = getStripe();
  if (!stripe) return FREE_STATE;
  const subs = await stripe.subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  return toBillingState(subs.data as unknown as SubscriptionLike[]);
}

export async function getBillingState(): Promise<BillingState> {
  const customerId = await findCustomerId();
  if (!customerId) return FREE_STATE;
  return getBillingStateForCustomer(customerId);
}
