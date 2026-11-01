"use client";

import { useId, useState } from "react";
import {
  PLANS,
  formatPrice,
  monthlyEquivalent,
  yearlySavingsPercent,
  type BillingInterval,
  type PlanId,
} from "@/lib/plans";
import { Badge, ButtonLink, buttonClass } from "./ui";
import { SubmitButton } from "./submit-button";

type Props = {
  /** "marketing" links to sign-in; "billing" posts to Stripe Checkout. */
  mode: "marketing" | "billing";
  currentPlan?: PlanId;
  checkoutAction?: (formData: FormData) => Promise<void>;
  billingEnabled?: boolean;
  headingLevel?: "h2" | "h3";
};

export function PricingTable({
  mode,
  currentPlan = "free",
  checkoutAction,
  billingEnabled = true,
  headingLevel = "h3",
}: Props) {
  const [interval, setInterval] = useState<BillingInterval>("month");
  const groupId = useId();
  const Heading = headingLevel;
  const maxSavings = Math.max(...PLANS.map(yearlySavingsPercent));

  return (
    <div>
      <fieldset className="mx-auto mb-8 flex w-fit rounded-full border border-border bg-surface p-1">
        <legend className="sr-only">Billing period</legend>
        {(["month", "year"] as const).map((value) => (
          <label
            key={value}
            className={`relative cursor-pointer rounded-full px-4 py-2 text-sm font-medium has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring ${
              interval === value ? "bg-text text-bg" : "text-muted hover:text-text"
            }`}
          >
            <input
              type="radio"
              name={`${groupId}-interval`}
              value={value}
              checked={interval === value}
              onChange={() => setInterval(value)}
              className="sr-only"
            />
            {value === "month" ? "Monthly" : `Yearly (save ${maxSavings}%)`}
          </label>
        ))}
      </fieldset>

      <ul className="grid gap-6 md:grid-cols-3" aria-label="Plans">
        {PLANS.map((plan) => {
          const isCurrent = mode === "billing" && plan.id === currentPlan;
          const price = monthlyEquivalent(plan, interval);
          return (
            <li
              key={plan.id}
              className={`flex flex-col rounded-2xl border bg-surface p-6 ${
                plan.highlighted ? "border-accent shadow-[0_0_0_1px_var(--accent)]" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <Heading className="text-lg font-semibold">{plan.name}</Heading>
                {isCurrent ? <Badge tone="ok">Current plan</Badge> : plan.highlighted ? <Badge tone="accent">Most popular</Badge> : null}
              </div>
              <p className="mt-1 text-sm text-muted">{plan.tagline}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight" data-testid={`price-${plan.id}`}>
                  {formatPrice(price)}
                </span>
                <span className="text-sm text-muted">/ month</span>
              </p>
              <p className="mt-1 h-5 text-xs text-muted">
                {plan.price.month > 0 && interval === "year"
                  ? `${formatPrice(plan.price.year)} billed yearly`
                  : plan.price.month > 0
                    ? "Billed monthly"
                    : "Free forever"}
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <svg aria-hidden="true" viewBox="0 0 20 20" className="mt-0.5 size-4 shrink-0 text-ok">
                      <path fill="currentColor" d="M7.6 13.6 4 10l1.4-1.4 2.2 2.2 7-7L16 5.2z" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <PlanAction
                  mode={mode}
                  planId={plan.id}
                  planName={plan.name}
                  interval={interval}
                  currentPlan={currentPlan}
                  checkoutAction={checkoutAction}
                  billingEnabled={billingEnabled}
                  highlighted={Boolean(plan.highlighted)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlanAction({
  mode,
  planId,
  planName,
  interval,
  currentPlan,
  checkoutAction,
  billingEnabled,
  highlighted,
}: {
  mode: Props["mode"];
  planId: PlanId;
  planName: string;
  interval: BillingInterval;
  currentPlan: PlanId;
  checkoutAction?: Props["checkoutAction"];
  billingEnabled: boolean;
  highlighted: boolean;
}) {
  const variant = highlighted ? "primary" : "secondary";
  if (mode === "marketing") {
    return (
      <ButtonLink href={planId === "free" ? "/sign-in" : "/dashboard/billing"} variant={variant} className="w-full">
        {planId === "free" ? "Start for free" : `Choose ${planName}`}
      </ButtonLink>
    );
  }
  if (planId === currentPlan) {
    return (
      <button type="button" disabled className={buttonClass("secondary", "w-full")}>
        Your current plan
      </button>
    );
  }
  if (planId === "free") {
    return <p className="text-center text-sm text-muted">Cancel any time from Manage billing.</p>;
  }
  if (currentPlan !== "free") {
    return <p className="text-center text-sm text-muted">Switch plans from Manage billing.</p>;
  }
  return (
    <form action={checkoutAction}>
      <input type="hidden" name="plan" value={planId} />
      <input type="hidden" name="interval" value={interval} />
      <SubmitButton
        disabled={!billingEnabled}
        variant={variant}
        className="w-full"
        pendingText="Opening checkout…"
        aria-label={`Upgrade to ${planName}, billed ${interval === "month" ? "monthly" : "yearly"}`}
      >
        Upgrade to {planName}
      </SubmitButton>
    </form>
  );
}
