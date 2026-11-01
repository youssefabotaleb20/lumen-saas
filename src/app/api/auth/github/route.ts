import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { safeNextPath } from "@/lib/safe-redirect";
import { STATE_COOKIE } from "@/lib/oauth";

export function GET(request: NextRequest) {
  if (!env.githubClientId) {
    return NextResponse.redirect(new URL("/sign-in?error=github-disabled", request.url));
  }
  const state = randomBytes(16).toString("hex");
  const next = safeNextPath(request.nextUrl.searchParams.get("next"));

  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.githubClientId);
  authorize.searchParams.set("redirect_uri", `${request.nextUrl.origin}/api/auth/github/callback`);
  authorize.searchParams.set("scope", "read:user");
  authorize.searchParams.set("state", state);

  const response = NextResponse.redirect(authorize);
  response.cookies.set(STATE_COOKIE, JSON.stringify({ state, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/auth/github",
    maxAge: 600,
  });
  return response;
}
