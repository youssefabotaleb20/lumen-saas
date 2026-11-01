import type { Metadata } from "next";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getBillingState } from "@/lib/billing";
import { getPlan, planIncludes } from "@/lib/plans";
import { SAMPLE_MONITORS } from "@/lib/sample-data";
import { Badge, ButtonLink, Card } from "@/components/ui";
import { ResponseChart } from "@/components/response-chart";
import { PageSkeleton } from "@/components/skeleton";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  return (
    <Suspense fallback={<PageSkeleton label="Loading your dashboard" />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const [user, billing] = await Promise.all([requireUser(), getBillingState()]);
  const plan = getPlan(billing.plan);
  const visible = SAMPLE_MONITORS.slice(0, plan.limits.monitors);
  const hidden = SAMPLE_MONITORS.length - visible.length;
  const hasInsights = planIncludes(billing.plan, "pro");
  const used = visible.length;
  const usedPct = Math.min(100, Math.round((used / plan.limits.monitors) * 100));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back, {user.name.split(" ")[0]}</h1>
        <p className="mt-1 text-sm text-muted">Monitor data on this page is sample data.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="text-sm text-muted">Plan</h2>
          <p className="mt-2 flex items-center gap-2 text-2xl font-semibold" data-testid="current-plan">
            {plan.name}
            {billing.status === "canceling" ? <Badge tone="danger">Canceling</Badge> : null}
            {billing.status === "past_due" ? <Badge tone="danger">Payment due</Badge> : null}
          </p>
          <ButtonLink href="/dashboard/billing" variant="ghost" className="-ml-4 mt-2">
            {billing.plan === "free" ? "Upgrade" : "Manage billing"}
          </ButtonLink>
        </Card>
        <Card>
          <h2 id="usage-label" className="text-sm text-muted">Monitors used</h2>
          <p className="mt-2 text-2xl font-semibold">
            {used} <span className="text-base font-normal text-muted">of {plan.limits.monitors}</span>
          </p>
          <div
            role="progressbar"
            aria-labelledby="usage-label"
            aria-valuemin={0}
            aria-valuemax={plan.limits.monitors}
            aria-valuenow={used}
            className="mt-4 h-2 overflow-hidden rounded-full bg-surface-2"
          >
            <div className={`h-full rounded-full ${usedPct >= 100 ? "bg-danger" : "bg-accent"}`} style={{ width: `${usedPct}%` }} />
          </div>
        </Card>
        <Card>
          <h2 className="text-sm text-muted">Check interval</h2>
          <p className="mt-2 text-2xl font-semibold">
            {plan.limits.checkIntervalSeconds >= 60
              ? `${plan.limits.checkIntervalSeconds / 60} min`
              : `${plan.limits.checkIntervalSeconds} sec`}
          </p>
          <p className="mt-2 text-sm text-muted">{plan.limits.statusPages} status page{plan.limits.statusPages === 1 ? "" : "s"}</p>
        </Card>
      </div>

      <Card padded={false}>
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="font-semibold">Monitors</h2>
          {hidden > 0 ? (
            <ButtonLink href="/dashboard/billing" variant="secondary">
              Upgrade to add more
            </ButtonLink>
          ) : null}
        </div>
        <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Monitors table">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Your monitors and their current status</caption>
            <thead className="border-y border-border bg-surface-2/60 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">Name</th>
                <th scope="col" className="px-6 py-3 font-medium">Status</th>
                <th scope="col" className="px-6 py-3 font-medium">Uptime (30 d)</th>
                <th scope="col" className="px-6 py-3 font-medium">Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visible.map((m) => (
                <tr key={m.name}>
                  <th scope="row" className="px-6 py-4 font-medium">
                    {m.name}
                    <span className="block font-mono text-xs font-normal text-muted">{m.url}</span>
                  </th>
                  <td className="px-6 py-4">
                    {m.status === "up" ? <Badge tone="ok">Up</Badge> : <Badge tone="danger">Down</Badge>}
                  </td>
                  <td className="px-6 py-4 font-mono">{m.uptime}%</td>
                  <td className="px-6 py-4 font-mono">{m.status === "up" ? `${m.responseMs} ms` : "n/a"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Response-time insights</h2>
          <Badge tone="accent">Pro</Badge>
        </div>
        {hasInsights ? (
          <div className="mt-4">
            <ResponseChart values={SAMPLE_MONITORS[1].responseSeries} label="Public API response time" />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border p-6 text-center" data-testid="insights-locked">
            <p className="text-sm text-muted">
              See which endpoints got slower and when it started. Available on Pro and Team.
            </p>
            <ButtonLink href="/dashboard/billing" className="mt-4">
              Unlock insights
            </ButtonLink>
          </div>
        )}
      </Card>
    </div>
  );
}
