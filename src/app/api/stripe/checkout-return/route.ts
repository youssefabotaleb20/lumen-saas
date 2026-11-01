import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSession } from "@/lib/session";
import { billingTag } from "@/lib/billing";
import { customerIdFromEvent } from "@/lib/webhook";

/**
 * Stripe Checkout sends the user here after paying. Expiring the cached
 * billing state means the dashboard shows the new plan straight away, even
 * if the webhook has not arrived yet.
 */
export async function GET(request: NextRequest) {
  const back = (status: string) =>
    NextResponse.redirect(new URL(`/dashboard/billing?checkout=${status}`, request.url));

  const stripe = getStripe();
  const sessionId = request.nextUrl.searchParams.get("session_id");
  const session = await getSession();
  if (!stripe || !sessionId || !session.user) return back("unknown");

  const checkout = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
  if (!checkout || checkout.client_reference_id !== session.user.id) return back("unknown");

  const customerId = customerIdFromEvent(checkout);
  if (customerId) {
    revalidateTag(billingTag(customerId), { expire: 0 });
    if (session.stripeCustomerId !== customerId) {
      session.stripeCustomerId = customerId;
      await session.save();
    }
  }
  return back(checkout.status === "complete" ? "success" : "pending");
}
