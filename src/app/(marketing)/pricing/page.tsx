import type { Metadata } from "next";
import { PricingTable } from "@/components/pricing-table";
import { Faq } from "@/components/faq";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Lumen plans: Free for side projects, Pro for growing products, Team for shared on-call. Monthly or yearly billing.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted">
          Every plan includes email alerts and SSL checks. Pay yearly and get two months free.
        </p>
      </div>
      <PricingTable mode="marketing" headingLevel="h2" />
      <div className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">Billing questions</h2>
        <Faq />
      </div>
    </div>
  );
}
