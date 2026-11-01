import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";
import { safeNextPath } from "@/lib/safe-redirect";
import { STATE_COOKIE } from "@/lib/oauth";

type GitHubUser = { id: number; login: string; name: string | null; avatar_url: string };

function fail(request: NextRequest, reason: string) {
  const response = NextResponse.redirect(new URL(`/sign-in?error=${reason}`, request.url));
  response.cookies.delete({ name: STATE_COOKIE, path: "/api/auth/github" });
  return response;
}

export async function GET(request: NextRequest) {
  if (!env.githubClientId || !env.githubClientSecret) return fail(request, "github-disabled");

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  let saved: { state?: string; next?: string } = {};
  try {
    saved = JSON.parse(request.cookies.get(STATE_COOKIE)?.value ?? "{}");
  } catch {
    saved = {};
  }
  if (!code || !state || state !== saved.state) return fail(request, "oauth-state");

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: env.githubClientId,
      client_secret: env.githubClientSecret,
      code,
      redirect_uri: `${request.nextUrl.origin}/api/auth/github/callback`,
    }),
  });
  const token = (await tokenRes.json().catch(() => ({}))) as { access_token?: string };
  if (!token.access_token) return fail(request, "oauth-token");

  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${token.access_token}`, Accept: "application/vnd.github+json" },
  });
  if (!userRes.ok) return fail(request, "oauth-profile");
  const gh = (await userRes.json()) as GitHubUser;

  const response = NextResponse.redirect(new URL(safeNextPath(saved.next), request.url));
  response.cookies.delete({ name: STATE_COOKIE, path: "/api/auth/github" });

  const session = await getIronSession<SessionData>(request, response, sessionOptions());
  session.user = {
    id: `github:${gh.id}`,
    name: gh.name || gh.login,
    avatarUrl: gh.avatar_url,
    provider: "github",
  };
  session.stripeCustomerId = undefined;
  await session.save();
  return response;
}
