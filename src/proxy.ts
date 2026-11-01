import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic check only: no session cookie means no access, so redirect
 * early. The real check happens in the data layer (`requireUser`).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("lumen_session")) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ["/dashboard/:path*"] };
