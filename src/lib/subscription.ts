import { parseLookupKey, type BillingInterval, type PlanId } from "./plans";

/** The subset of a Stripe subscription this app reads, so it is easy to test. */
export type SubscriptionLike = {
  id: string;
  status: string;
  cancel_at_period_end: boolean;
  cancel_at?: number | null;
  items: {
    data: Array<{
      current_period_end?: number;
      price: { lookup_key: string | null };
    }>;
  };
};

export type BillingState = {
  plan: PlanId;
  interval: BillingInterval | null;
  status: "none" | "active" | "trialing" | "past_due" | "canceling";
  /** Unix seconds: renewal date, or end of access when canceling. */
  periodEnd: number | null;
  subscriptionId: string | null;
};

export const FREE_STATE: BillingState = {
  plan: "free",
  interval: null,
  status: "none",
  periodEnd: null,
  subscriptionId: null,
};

const LIVE_STATUSES = ["active", "trialing", "past_due"] as const;
const PRIORITY: Record<string, number> = { active: 0, trialing: 1, past_due: 2 };

/**
 * Picks the subscription that grants access and maps it to a plan.
 * Canceled, incomplete and unpaid subscriptions fall back to Free.
 */
export function toBillingState(subscriptions: SubscriptionLike[]): BillingState {
  const live = subscriptions
    .filter((s) => (LIVE_STATUSES as readonly string[]).includes(s.status))
    .sort((a, b) => PRIORITY[a.status] - PRIORITY[b.status]);

  for (const sub of live) {
    const item = sub.items.data[0];
    const parsed = parseLookupKey(item?.price.lookup_key);
    if (!parsed) continue;

    const canceling = sub.cancel_at_period_end || Boolean(sub.cancel_at);
    return {
      plan: parsed.plan,
      interval: parsed.interval,
      status: canceling ? "canceling" : (sub.status as BillingState["status"]),
      periodEnd: sub.cancel_at ?? item?.current_period_end ?? null,
      subscriptionId: sub.id,
    };
  }
  return FREE_STATE;
}
