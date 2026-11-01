import type { Metadata } from "next";
import { Suspense } from "react";
import { signInAsDemo } from "@/app/actions/auth";
import { SubmitButton } from "@/components/submit-button";
import { buttonClass, Card } from "@/components/ui";
import { features } from "@/lib/env";
import { safeNextPath } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Lumen with GitHub, or try the demo account.",
  alternates: { canonical: "/sign-in" },
  robots: { index: false, follow: true },
};

const ERRORS: Record<string, string> = {
  "github-disabled": "GitHub sign-in is not set up on this deployment. Use the demo account instead.",
  "oauth-state": "That sign-in link expired or was already used. Please try again.",
  "oauth-token": "GitHub did not accept the sign-in. Please try again.",
  "oauth-profile": "We could not read your GitHub profile. Please try again.",
};

export default function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <h1 className="text-center text-3xl font-semibold tracking-tight">Sign in to Lumen</h1>
      <p className="mt-3 text-center text-muted">Use GitHub, or look around with a demo account.</p>
      <Card className="mt-8">
        <Suspense fallback={<SignInOptions next="/dashboard" />}>
          <SignInWithParams searchParams={searchParams} />
        </Suspense>
      </Card>
      <p className="mt-6 text-center text-sm text-muted">
        Demo accounts are temporary. Anything you do in Stripe uses test mode.
      </p>
    </div>
  );
}

async function SignInWithParams({ searchParams }: Pick<PageProps<"/sign-in">, "searchParams">) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  return <SignInOptions next={safeNextPath(params.next)} error={error} />;
}

function SignInOptions({ next, error }: { next: string; error?: string }) {
  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          {error}
        </p>
      ) : null}
      {features.github ? (
        <a href={`/api/auth/github?next=${encodeURIComponent(next)}`} className={buttonClass("secondary", "w-full")}>
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-5">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
          Continue with GitHub
        </a>
      ) : null}
      <form action={signInAsDemo}>
        <input type="hidden" name="next" value={next} />
        <SubmitButton className="w-full" pendingText="Signing in…">
          Continue with the demo account
        </SubmitButton>
      </form>
    </div>
  );
}
