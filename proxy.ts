import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { locales, matchLocale } from "@/lib/i18n";

/**
 * The admin area never gets a locale prefix: its language is a preference kept
 * in a cookie rather than part of the address. See `lib/admin-i18n.ts`.
 */
const adminPaths = ["/admin", "/login"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminPath = adminPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isAdminPath) {
    /**
     * Only reads the cookie — no database call, because the proxy runs on every
     * request, prefetches included. It is a fast way to bounce visitors who are
     * clearly not signed in, not a security boundary: a forged cookie gets past
     * it. The real check is `requireSession()` in `lib/session.ts`, which every
     * admin page and Server Action runs.
     */
    if (pathname.startsWith("/admin") && !getSessionCookie(request)) {
      return NextResponse.redirect(new URL("/login", request.nextUrl));
    }

    return;
  }

  const alreadyLocalized = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  if (alreadyLocalized) return;

  request.nextUrl.pathname = `/${matchLocale(request.headers.get("accept-language"))}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip internals, API routes and anything that looks like a file in public/.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
