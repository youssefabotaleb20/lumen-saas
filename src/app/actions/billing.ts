"use server";

import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";
import { getOrigin } from "@/lib/origin";
import { findCustomerId, getBillingState } from "@/lib/billing";
import { isBillingInterval, isPaidPlanId, lookupKeyFor } from "@/lib/plans";

export async function startCheckout(formData: FormData) {
  const plan = formData.get("plan");
  const interval = formData.get("interval");
  if (!isPaidPlanId(plan) || !isBillingInterval(interval)) {
    redirect("/dashboard/billing?error=invalid-plan");
  }

  const session = await getSession();
  if (!session.user) redirect(`/sign-in?next=/dashboard/billing`);

  const stripe = getStripe();
  if (!stripe) redirect("/dashboard/billing?error=billing-disabled");

  // Someone already paying changes plan in the portal, never a second subscription.
  const current = await getBillingState();
  if (current.plan !== "free") return openBillingPortal();

  let customerId = await findCustomerId();
  if (!customerId) {
    const customer = await stripe.customers.create({
      name: session.user.name,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
  }
  session.stripeCustomerId = customerId;
  await session.save();

  const lookupKey = lookupKeyFor(plan, interval);
  const prices = await stripe.prices.list({ lookup_keys: [lookupKey], active: true, limit: 1 });
  const price = prices.data[0];
  if (!price) redirect("/dashboard/billing?error=price-missing");

  const origin = await getOrigin();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: price.id, quantity: 1 }],
    client_reference_id: session.user.id,
    allow_promotion_codes: true,
    success_url: `${origin}/api/stripe/checkout-return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/dashboard/billing?checkout=canceled`,
  });
  if (!checkout.url) redirect("/dashboard/billing?error=checkout-failed");
  redirect(checkout.url);
}

export async function openBillingPortal() {
  const stripe = getStripe();
  if (!stripe) redirect("/dashboard/billing?error=billing-disabled");
  const customerId = await findCustomerId();
  if (!customerId) redirect("/dashboard/billing?error=no-customer");

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${await getOrigin()}/dashboard/billing`,
  });
  redirect(portal.url);
}
