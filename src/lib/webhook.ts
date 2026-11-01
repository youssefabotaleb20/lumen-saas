export const HANDLED_EVENTS = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.payment_failed",
  "invoice.paid",
]);

/** Customer id from any Stripe object that carries one, expanded or not. */
export function customerIdFromEvent(object: unknown): string | null {
  if (!object || typeof object !== "object" || !("customer" in object)) return null;
  const customer = (object as { customer: unknown }).customer;
  if (typeof customer === "string") return customer;
  if (customer && typeof customer === "object" && "id" in customer) {
    const id = (customer as { id: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}
