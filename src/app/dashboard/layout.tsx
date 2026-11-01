import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserMenu } from "@/components/user-menu";
import { Logo } from "@/components/ui";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Lumen dashboard" },
  robots: { index: false, follow: false },
};

export default function DashboardLayout({ children }: LayoutProps<"/dashboard">) {
  return (
    <>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" aria-label="Lumen home" className="rounded-md">
            <Logo className="text-lg" />
          </Link>
          <Suspense fallback={<div className="h-8 w-40 animate-pulse rounded-lg bg-surface-2" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row">
        <aside className="md:w-48 md:shrink-0">
          <DashboardNav />
        </aside>
        <main id="main" className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
