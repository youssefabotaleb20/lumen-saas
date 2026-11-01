import { PricingTable } from "@/components/pricing-table";
import { StatusPreview } from "@/components/status-preview";
import { Faq, FAQ_ITEMS } from "@/components/faq";
import { ButtonLink } from "@/components/ui";
import { PLANS } from "@/lib/plans";
import { site } from "@/lib/site";

const FEATURES = [
  {
    title: "Checks every minute",
    body: "HTTP, keyword and SSL checks from several regions, so a blip in one place does not wake you up.",
  },
  {
    title: "Alerts that reach you",
    body: "Email, Slack and webhooks the moment a check fails twice in a row, and again when it recovers.",
  },
  {
    title: "Status pages",
    body: "A public page on your own domain that tells users what is going on before they open a ticket.",
  },
  {
    title: "Response-time insights",
    body: "See which endpoints got slower this week and when it started, without setting up a metrics stack.",
  },
];

function JsonLd() {
  const data = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: site.name,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      description: site.description,
      url: site.url,
      offers: PLANS.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        price: plan.price.month,
        priceCurrency: "USD",
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_ITEMS.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-24">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Uptime monitoring</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Know your site is down before your users do.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
            Lumen checks your sites and APIs around the clock, alerts you the moment something
            breaks, and keeps your users informed with a status page.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/sign-in">Try the live demo</ButtonLink>
            <ButtonLink href="/pricing" variant="secondary">
              See pricing
            </ButtonLink>
          </div>
          <p className="mt-4 text-sm text-muted">No card needed. Payments run in Stripe test mode.</p>
        </div>
        <StatusPreview />
      </section>

      <section id="features" aria-labelledby="features-title" className="border-y border-border bg-surface-2/50">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <h2 id="features-title" className="text-3xl font-semibold tracking-tight">
            Everything you need to sleep through the night
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-2xl border border-border bg-surface p-6">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="pricing-title" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 text-center">
          <h2 id="pricing-title" className="text-3xl font-semibold tracking-tight">
            Simple pricing that grows with you
          </h2>
          <p className="mt-3 text-muted">Start free. Upgrade when you need faster checks and status pages.</p>
        </div>
        <PricingTable mode="marketing" />
      </section>

      <section aria-labelledby="faq-title" className="mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <h2 id="faq-title" className="mb-8 text-center text-3xl font-semibold tracking-tight">
          Questions
        </h2>
        <Faq />
      </section>
    </>
  );
}
