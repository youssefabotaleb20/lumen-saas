import { revalidateTag } from "next/cache";
import { getStripe } from "@/lib/stripe";
import { env } from "@/lib/env";
import { billingTag } from "@/lib/billing";
import { customerIdFromEvent, HANDLED_EVENTS } from "@/lib/webhook";

/**
 * Stripe webhook. Stripe stays the source of truth for subscriptions, so the
 * only job here is to verify the signature and expire the customer's cached
 * billing state, so the dashboard shows the change on the next request.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe || !env.stripeWebhookSecret) {
    return Response.json({ error: "Billing is not configured" }, { status: 501 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Missing signature" }, { status: 400 });

  const payload = await request.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, env.stripeWebhookSecret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (HANDLED_EVENTS.has(event.type)) {
    const customerId = customerIdFromEvent(event.data.object);
    if (customerId) revalidateTag(billingTag(customerId), { expire: 0 });
  }
  return Response.json({ received: true });
}
