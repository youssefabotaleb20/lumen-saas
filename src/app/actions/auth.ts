"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { safeNextPath } from "@/lib/safe-redirect";

/** Each visitor gets a fresh demo account, so test checkouts never collide. */
export async function signInAsDemo(formData: FormData) {
  const session = await getSession();
  session.user = { id: `demo:${randomUUID()}`, name: "Demo user", provider: "demo" };
  session.stripeCustomerId = undefined;
  await session.save();
  redirect(safeNextPath(formData.get("next")));
}

export async function signOut() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
