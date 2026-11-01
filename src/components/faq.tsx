export const FAQ_ITEMS = [
  {
    q: "Is this a real product?",
    a: "Lumen is a demo product for a Next.js SaaS starter. Sign-in, billing and the dashboard all work, but monitor data is sample data and Stripe runs in test mode, so no card is ever charged.",
  },
  {
    q: "How do I try a paid plan?",
    a: "Sign in with the demo account, open Billing and pick a plan. On the Stripe checkout page use the test card 4242 4242 4242 4242 with any future date and any CVC.",
  },
  {
    q: "Can I cancel or switch plans?",
    a: "Yes. Manage billing opens the Stripe customer portal, where you can switch plans, update the card or cancel. The dashboard updates as soon as Stripe tells the app.",
  },
  {
    q: "Where is my data stored?",
    a: "Your session lives in an encrypted cookie and your subscription lives in Stripe. The app keeps no database of its own.",
  },
];

export function Faq() {
  return (
    <div className="divide-y divide-border rounded-2xl border border-border bg-surface">
      {FAQ_ITEMS.map((item) => (
        <details key={item.q} className="group p-5 [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-md font-medium">
            <h3>{item.q}</h3>
            <svg aria-hidden="true" viewBox="0 0 20 20" className="size-5 shrink-0 text-muted transition-transform group-open:rotate-45">
              <path fill="currentColor" d="M9 4h2v5h5v2h-5v5H9v-5H4V9h5z" />
            </svg>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
        </details>
      ))}
    </div>
  );
}
