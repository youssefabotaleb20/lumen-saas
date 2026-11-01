export type PlanId = "free" | "pro" | "team";
export type BillingInterval = "month" | "year";

export type Plan = {
  id: PlanId;
  name: string;
  tagline: string;
  /** Price in whole US dollars. Yearly is the full-year price. */
  price: Record<BillingInterval, number>;
  features: string[];
  limits: {
    monitors: number;
    checkIntervalSeconds: number;
    statusPages: number;
    teamSeats: number;
  };
  highlighted?: boolean;
};

export const PLANS: readonly Plan[] = [
  {
    id: "free",
    name: "Free",
    tagline: "For side projects and trying things out.",
    price: { month: 0, year: 0 },
    features: ["3 monitors", "5-minute checks", "Email alerts", "7 days of history"],
    limits: { monitors: 3, checkIntervalSeconds: 300, statusPages: 0, teamSeats: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "For freelancers and growing products.",
    price: { month: 12, year: 120 },
    features: [
      "50 monitors",
      "1-minute checks",
      "Public status page",
      "Response-time insights",
      "90 days of history",
    ],
    limits: { monitors: 50, checkIntervalSeconds: 60, statusPages: 1, teamSeats: 1 },
    highlighted: true,
  },
  {
    id: "team",
    name: "Team",
    tagline: "For teams who share on-call.",
    price: { month: 29, year: 290 },
    features: [
      "200 monitors",
      "30-second checks",
      "5 status pages",
      "Up to 10 teammates",
      "1 year of history",
    ],
    limits: { monitors: 200, checkIntervalSeconds: 30, statusPages: 5, teamSeats: 10 },
  },
] as const;

export const PAID_PLAN_IDS = ["pro", "team"] as const;
export type PaidPlanId = (typeof PAID_PLAN_IDS)[number];

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id);
  if (!plan) throw new Error(`Unknown plan: ${id}`);
  return plan;
}

export function isPaidPlanId(value: unknown): value is PaidPlanId {
  return typeof value === "string" && (PAID_PLAN_IDS as readonly string[]).includes(value);
}

export function isBillingInterval(value: unknown): value is BillingInterval {
  return value === "month" || value === "year";
}

/** Stripe price lookup key for a paid plan, e.g. `lumen_pro_monthly`. */
export function lookupKeyFor(plan: PaidPlanId, interval: BillingInterval): string {
  return `lumen_${plan}_${interval === "month" ? "monthly" : "yearly"}`;
}

/** Inverse of {@link lookupKeyFor}. Returns null for keys this app does not own. */
export function parseLookupKey(
  key: string | null | undefined,
): { plan: PaidPlanId; interval: BillingInterval } | null {
  const match = /^lumen_(pro|team)_(monthly|yearly)$/.exec(key ?? "");
  if (!match) return null;
  return {
    plan: match[1] as PaidPlanId,
    interval: match[2] === "monthly" ? "month" : "year",
  };
}

/** Effective monthly price, used to show "$10/mo billed yearly". */
export function monthlyEquivalent(plan: Plan, interval: BillingInterval): number {
  const value = interval === "month" ? plan.price.month : plan.price.year / 12;
  return Math.round(value * 100) / 100;
}

/** Whole-number percentage saved by paying yearly instead of monthly. */
export function yearlySavingsPercent(plan: Plan): number {
  if (plan.price.month === 0) return 0;
  const full = plan.price.month * 12;
  return Math.round(((full - plan.price.year) / full) * 100);
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const RANK: Record<PlanId, number> = { free: 0, pro: 1, team: 2 };

/** True when `current` includes everything `required` does. */
export function planIncludes(current: PlanId, required: PlanId): boolean {
  return RANK[current] >= RANK[required];
}
