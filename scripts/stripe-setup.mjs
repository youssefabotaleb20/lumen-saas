#!/usr/bin/env node
/**
 * Creates the Lumen products and prices in your Stripe account (test mode),
 * keyed by lookup_key so the app never needs price IDs in env vars.
 * Safe to re-run: existing lookup keys are left alone.
 *
 *   STRIPE_SECRET_KEY=sk_test_... npm run stripe:setup
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("Set STRIPE_SECRET_KEY first (use a test key, sk_test_...).");
  process.exit(1);
}
if (!key.startsWith("sk_test_") && !process.argv.includes("--live")) {
  console.error("Refusing to run with a live key. Pass --live if you really mean it.");
  process.exit(1);
}

const stripe = new Stripe(key);

const PLANS = [
  { id: "pro", name: "Lumen Pro", monthly: 1200, yearly: 12000 },
  { id: "team", name: "Lumen Team", monthly: 2900, yearly: 29000 },
];

const prices = [];
for (const plan of PLANS) {
  const lookupKeys = [`lumen_${plan.id}_monthly`, `lumen_${plan.id}_yearly`];
  const existing = await stripe.prices.list({ lookup_keys: lookupKeys, expand: ["data.product"] });
  let productId = existing.data[0]?.product?.id;
  if (!productId) {
    const product = await stripe.products.create({ name: plan.name, metadata: { plan: plan.id } });
    productId = product.id;
    console.log(`Created product ${plan.name}`);
  }
  for (const [interval, amount, lookupKey] of [
    ["month", plan.monthly, lookupKeys[0]],
    ["year", plan.yearly, lookupKeys[1]],
  ]) {
    let price = existing.data.find((p) => p.lookup_key === lookupKey);
    if (!price) {
      price = await stripe.prices.create({
        product: productId,
        currency: "usd",
        unit_amount: amount,
        recurring: { interval },
        lookup_key: lookupKey,
      });
      console.log(`Created price ${lookupKey}`);
    } else {
      console.log(`Price ${lookupKey} already exists`);
    }
    prices.push({ product: productId, price: price.id });
  }
}

// Customer portal: let people switch between plans, update cards and cancel.
const byProduct = new Map();
for (const { product, price } of prices) {
  byProduct.set(product, [...(byProduct.get(product) ?? []), price]);
}
const portalConfig = {
  business_profile: { headline: "Lumen (test mode)" },
  features: {
    customer_update: { enabled: true, allowed_updates: ["email", "name"] },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: { enabled: true, mode: "at_period_end" },
    subscription_update: {
      enabled: true,
      default_allowed_updates: ["price"],
      proration_behavior: "create_prorations",
      products: [...byProduct].map(([product, list]) => ({ product, prices: list })),
    },
  },
  default_return_url: process.env.NEXT_PUBLIC_SITE_URL
    ? `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/billing`
    : undefined,
};
const [current] = (await stripe.billingPortal.configurations.list({ is_default: true, limit: 1 })).data;
if (current) {
  await stripe.billingPortal.configurations.update(current.id, portalConfig);
} else {
  await stripe.billingPortal.configurations.create(portalConfig);
}
console.log("Configured the customer portal. Done.");
