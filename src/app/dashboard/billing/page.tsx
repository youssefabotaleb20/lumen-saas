import type { Metadata } from "next";
import { Suspense } from "react";
import { startCheckout, openBillingPortal } from "@/app/actions/billing";
import { requireUser } from "@/lib/auth";
import { findCustomerId, getBillingState } from "@/lib/billing";
import { features } from "@/lib/env";
import { getPlan } from "@/lib/plans";
import { PricingTable } from "@/components/pricing-table";
import { SubmitButton } from "@/components/submit-button";
import { Badge, Card } from "@/components/ui";
import { PageSkeleton } from "@/components/skeleton";

export const metadata: Metadata = { title: "Billing" };

const NOTICES: Record<string, { tone: "ok" | "danger" | "neutral"; text: string }> = {
  "checkout=success": { tone: "ok", text: "Payment received. Your new plan is active." },
  "checkout=pending": { tone: "neutral", text: "Stripe is still confirming your payment. This page updates once it does." },
  "checkout=canceled": { tone: "neutral", text: "Checkout canceled. You have not been charged." },
  "error=billing-disabled": { tone: "danger", text: "Billing is not set up on this deployment yet." },
  "error=price-missing": { tone: "danger", text: "That plan is not set up in Stripe yet. Run the Stripe setup script." },
  "error=invalid-plan": { tone: "danger", text: "That plan does not exist." },
  "error=no-customer": { tone: "danger", text: "You do not have a billing account yet. Pick a plan first." },
  "error=checkout-failed": { tone: "danger", text: "Stripe could not start checkout. Please try again." },
};

export default function BillingPage({ searchParams }: PageProps<"/dashboard/billing">) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
        <p className="mt-1 text-sm text-muted">
          Test mode: pay with card 4242 4242 4242 4242, any future date and any CVC.
        </p>
      </div>
      <Suspense fallback={<PageSkeleton label="Loading billing" />}>
        <Billing searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

function noticeFor(params: Record<string, string | string[] | undefined>) {
  for (const key of ["checkout", "error"]) {
    const value = params[key];
    if (typeof value === "string" && NOTICES[`${key}=${value}`]) return NOTICES[`${key}=${value}`];
  }
  return null;
}

async function Billing({ searchParams }: Pick<PageProps<"/dashboard/billing">, "searchParams">) {
  await requireUser();
  const [params, billing, customerId] = await Promise.all([searchParams, getBillingState(), findCustomerId()]);
  const notice = noticeFor(params);
  const plan = getPlan(billing.plan);
  const periodEnd = billing.periodEnd
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long", timeZone: "UTC" }).format(new Date(billing.periodEnd * 1000))
    : null;

  const toneClass = { ok: "bg-ok-soft text-ok", danger: "bg-danger-soft text-danger", neutral: "bg-surface-2 text-text" };

  return (
    <>
      {notice ? (
        <p role={notice.tone === "danger" ? "alert" : "status"} className={`rounded-lg px-4 py-3 text-sm ${toneClass[notice.tone]}`}>
          {notice.text}
        </p>
      ) : null}
      {!features.billing ? (
        <p role="status" className="rounded-lg bg-surface-2 px-4 py-3 text-sm">
          Stripe keys are not set on this deployment, so upgrades are turned off. See the README to add them.
        </p>
      ) : null}

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-sm text-muted">Current plan</h2>
            <p className="mt-1 flex items-center gap-2 text-2xl font-semibold" data-testid="billing-plan">
              {plan.name}
              {billing.interval ? (
                <span className="text-base font-normal text-muted">
                  billed {billing.interval === "month" ? "monthly" : "yearly"}
                </span>
              ) : null}
              {billing.status === "canceling" ? <Badge tone="danger">Canceling</Badge> : null}
              {billing.status === "past_due" ? <Badge tone="danger">Payment due</Badge> : null}
              {billing.status === "trialing" ? <Badge tone="accent">Trial</Badge> : null}
            </p>
            {periodEnd ? (
              <p className="mt-1 text-sm text-muted">
                {billing.status === "canceling" ? `Access ends on ${periodEnd}.` : `Renews on ${periodEnd}.`}
              </p>
            ) : (
              <p className="mt-1 text-sm text-muted">Free forever. Upgrade any time.</p>
            )}
          </div>
          {customerId && features.billing ? (
            <form action={openBillingPortal}>
              <SubmitButton variant="secondary" pendingText="Opening portal…">
                Manage billing
              </SubmitButton>
            </form>
          ) : null}
        </div>
      </Card>

      <section aria-labelledby="plans-title">
        <h2 id="plans-title" className="mb-4 text-lg font-semibold">
          Plans
        </h2>
        <PricingTable
          mode="billing"
          currentPlan={billing.plan}
          checkoutAction={startCheckout}
          billingEnabled={features.billing}
        />
      </section>
    </>
  );
}
