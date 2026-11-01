import Link from "next/link";
import { site } from "@/lib/site";
import { Logo } from "./ui";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex flex-col gap-2">
          <Logo />
          <p>A Next.js SaaS starter. Payments run in Stripe test mode, so no real charges.</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/pricing" className="hover:text-text">Pricing</Link>
          <Link href="/sign-in" className="hover:text-text">Sign in</Link>
          <a href={site.repo} className="hover:text-text" rel="noopener">Source on GitHub</a>
          <a href={site.author.url} className="hover:text-text" rel="noopener">Built by {site.author.name}</a>
        </nav>
      </div>
    </footer>
  );
}
