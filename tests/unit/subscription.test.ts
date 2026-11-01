import { describe, expect, it } from "vitest";
import { FREE_STATE, toBillingState, type SubscriptionLike } from "@/lib/subscription";

function sub(overrides: Partial<SubscriptionLike> & { lookupKey?: string | null; periodEnd?: number } = {}): SubscriptionLike {
  const { lookupKey = "lumen_pro_monthly", periodEnd = 1_800_000_000, ...rest } = overrides;
  return {
    id: "sub_1",
    status: "active",
    cancel_at_period_end: false,
    cancel_at: null,
    items: { data: [{ current_period_end: periodEnd, price: { lookup_key: lookupKey } }] },
    ...rest,
  };
}

describe("toBillingState", () => {
  it("is Free with no subscriptions", () => {
    expect(toBillingState([])).toEqual(FREE_STATE);
  });

  it("maps an active subscription to its plan and renewal date", () => {
    expect(toBillingState([sub({ lookupKey: "lumen_team_yearly" })])).toEqual({
      plan: "team",
      interval: "year",
      status: "active",
      periodEnd: 1_800_000_000,
      subscriptionId: "sub_1",
    });
  });

  it("treats canceled and incomplete subscriptions as Free", () => {
    expect(toBillingState([sub({ status: "canceled" }), sub({ status: "incomplete" })])).toEqual(FREE_STATE);
  });

  it("marks a subscription set to cancel and uses its end date", () => {
    const state = toBillingState([sub({ cancel_at_period_end: true, cancel_at: 1_900_000_000 })]);
    expect(state.status).toBe("canceling");
    expect(state.periodEnd).toBe(1_900_000_000);
    expect(state.plan).toBe("pro");
  });

  it("prefers an active subscription over a past-due one", () => {
    const state = toBillingState([
      sub({ id: "sub_old", status: "past_due", lookupKey: "lumen_pro_monthly" }),
      sub({ id: "sub_new", status: "active", lookupKey: "lumen_team_monthly" }),
    ]);
    expect(state.subscriptionId).toBe("sub_new");
    expect(state.plan).toBe("team");
  });

  it("skips prices from other products", () => {
    expect(toBillingState([sub({ lookupKey: "someone_elses_price" })])).toEqual(FREE_STATE);
  });
});
