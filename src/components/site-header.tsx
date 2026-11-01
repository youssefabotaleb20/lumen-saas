import Link from "next/link";
import { ButtonLink, Logo } from "./ui";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Lumen home" className="rounded-md">
          <Logo className="text-lg" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 sm:gap-2">
          <Link href="/#features" className="hidden rounded-md px-3 py-2 text-sm text-muted hover:text-text sm:inline-block">
            Features
          </Link>
          <Link href="/pricing" className="rounded-md px-3 py-2 text-sm text-muted hover:text-text">
            Pricing
          </Link>
          <ButtonLink href="/dashboard" variant="primary" className="ml-1">
            Dashboard
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
