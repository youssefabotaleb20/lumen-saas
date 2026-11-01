import { describe, expect, it } from "vitest";
import {
  formatPrice,
  getPlan,
  isPaidPlanId,
  lookupKeyFor,
  monthlyEquivalent,
  parseLookupKey,
  planIncludes,
  yearlySavingsPercent,
} from "@/lib/plans";

describe("plans", () => {
  it("round-trips Stripe lookup keys", () => {
    expect(lookupKeyFor("pro", "month")).toBe("lumen_pro_monthly");
    expect(lookupKeyFor("team", "year")).toBe("lumen_team_yearly");
    expect(parseLookupKey("lumen_team_yearly")).toEqual({ plan: "team", interval: "year" });
  });

  it("ignores lookup keys the app does not own", () => {
    expect(parseLookupKey("lumen_free_monthly")).toBeNull();
    expect(parseLookupKey("other_pro_monthly")).toBeNull();
    expect(parseLookupKey(null)).toBeNull();
  });

  it("shows the yearly price as a monthly equivalent", () => {
    expect(monthlyEquivalent(getPlan("pro"), "month")).toBe(12);
    expect(monthlyEquivalent(getPlan("pro"), "year")).toBe(10);
    expect(monthlyEquivalent(getPlan("team"), "year")).toBe(24.17);
  });

  it("works out the yearly saving", () => {
    expect(yearlySavingsPercent(getPlan("pro"))).toBe(17);
    expect(yearlySavingsPercent(getPlan("free"))).toBe(0);
  });

  it("formats whole and fractional prices", () => {
    expect(formatPrice(12)).toBe("$12");
    expect(formatPrice(24.17)).toBe("$24.17");
  });

  it("ranks plans for feature gating", () => {
    expect(planIncludes("team", "pro")).toBe(true);
    expect(planIncludes("pro", "pro")).toBe(true);
    expect(planIncludes("free", "pro")).toBe(false);
  });

  it("only accepts paid plan ids from form input", () => {
    expect(isPaidPlanId("pro")).toBe(true);
    expect(isPaidPlanId("free")).toBe(false);
    expect(isPaidPlanId("enterprise")).toBe(false);
    expect(isPaidPlanId(undefined)).toBe(false);
  });
});
