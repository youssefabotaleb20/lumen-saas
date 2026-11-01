import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "./session";

/** The signed-in user, or null. Deduplicated per request. */
export const getOptionalUser = cache(async (): Promise<SessionUser | null> => {
  const session = await getSession();
  return session.user ?? null;
});

/** The signed-in user; redirects to sign-in when there is none. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getOptionalUser();
  if (!user) redirect("/sign-in");
  return user;
}
