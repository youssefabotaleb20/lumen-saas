import "server-only";
import { cookies } from "next/headers";
import { getIronSession, type SessionOptions } from "iron-session";

export type SessionUser = {
  id: string;
  name: string;
  avatarUrl?: string;
  provider: "github" | "demo";
};

export type SessionData = {
  user?: SessionUser;
  stripeCustomerId?: string;
};

export const SESSION_COOKIE = "lumen_session";

const DEV_PASSWORD = "dev-only-password-change-me-please-32chars-min";

function password(): string {
  const value = process.env.SESSION_PASSWORD;
  if (value && value.length >= 32) return value;
  if (process.env.NODE_ENV === "production" && !process.env.CI) {
    throw new Error("SESSION_PASSWORD must be set to at least 32 characters in production.");
  }
  return DEV_PASSWORD;
}

export function sessionOptions(): SessionOptions {
  return {
    cookieName: SESSION_COOKIE,
    password: password(),
    ttl: 60 * 60 * 24 * 7,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

/** Read-write session. Saving only works in Route Handlers and Server Actions. */
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}
