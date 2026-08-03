import { NextResponse, type NextRequest } from "next/server";

import { defaultLocale, isLocale, locales } from "@/lib/i18n";

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
