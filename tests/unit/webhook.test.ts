import Stripe from "stripe";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { customerIdFromEvent } from "@/lib/webhook";

const revalidateTag = vi.fn();
vi.mock("next/cache", () => ({ revalidateTag, cacheTag: vi.fn(), cacheLife: vi.fn() }));

const SECRET = "whsec_test_secret";

describe("customerIdFromEvent", () => {
  it("reads a plain or expanded customer", () => {
    expect(customerIdFromEvent({ customer: "cus_1" })).toBe("cus_1");
    expect(customerIdFromEvent({ customer: { id: "cus_2" } })).toBe("cus_2");
    expect(customerIdFromEvent({ customer: null })).toBeNull();
    expect(customerIdFromEvent(null)).toBeNull();
  });
});

describe("POST /api/stripe/webhook", () => {
  beforeEach(() => {
    vi.resetModules();
    revalidateTag.mockClear();
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_dummy");
    vi.stubEnv("STRIPE_WEBHOOK_SECRET", SECRET);
  });
  afterEach(() => vi.unstubAllEnvs());

  async function post(body: string, signature?: string) {
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const headers = new Headers({ "content-type": "application/json" });
    if (signature) headers.set("stripe-signature", signature);
    return POST(new Request("http://localhost/api/stripe/webhook", { method: "POST", body, headers }));
  }

  function event(type: string, object: Record<string, unknown>) {
    return JSON.stringify({ id: "evt_1", object: "event", type, data: { object } });
  }

  it("rejects requests without a signature", async () => {
    const res = await post(event("customer.subscription.updated", { customer: "cus_1" }));
    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("rejects a forged signature", async () => {
    const payload = event("customer.subscription.updated", { customer: "cus_1" });
    const forged = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({ payload, secret: "whsec_wrong" });
    const res = await post(payload, forged);
    expect(res.status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("expires the customer's billing cache on a signed subscription event", async () => {
    const payload = event("customer.subscription.updated", { customer: "cus_42" });
    const signature = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({ payload, secret: SECRET });
    const res = await post(payload, signature);
    expect(res.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledWith("billing:cus_42", { expire: 0 });
  });

  it("acknowledges events it does not handle without touching the cache", async () => {
    const payload = event("product.created", { id: "prod_1" });
    const signature = new Stripe("sk_test_dummy").webhooks.generateTestHeaderString({ payload, secret: SECRET });
    const res = await post(payload, signature);
    expect(res.status).toBe(200);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
