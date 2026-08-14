import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, locales } from "@/lib/i18n";

/**
 * The admin area is a tool for one person rather than part of the site, so it
 * is not translated and never gets a locale prefix. See `app/(admin)`.
 */
const adminPaths = ["/admin", "/login"];

/**
 * Picks the best supported locale from the `Accept-Language` header, highest
 * quality value first. Region subtags are ignored, so `en-GB` matches `en`.
 */
function detectLocale(request: NextRequest) {
  const header = request.headers.get("accept-language");

  if (!header) return defaultLocale;

  const preferences = header
    .split(",")
    .map((entry) => {
      const [tag, quality] = entry.trim().split(";q=");
      return { tag: tag.toLowerCase(), quality: quality ? Number(quality) : 1 };
    })
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of preferences) {
    const language = tag.split("-")[0];
    if (isLocale(language)) return language;
  }

  return defaultLocale;
}

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

  request.nextUrl.pathname = `/${detectLocale(request)}${pathname}`;

  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip internals, API routes and anything that looks like a file in public/.
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
