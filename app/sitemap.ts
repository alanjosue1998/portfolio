import type { MetadataRoute } from "next";

import { locales } from "@/lib/i18n";
import { localizedPages } from "@/lib/metadata";
import { siteUrl } from "@/lib/site";

/**
 * Every page in every locale, built from `locales` in `lib/i18n.ts` and
 * `localizedPages` in `lib/metadata.ts` — adding a locale or a page there puts
 * it here too.
 *
 * `/` is deliberately absent. `proxy.ts` redirects it to a locale based on
 * `Accept-Language`, so it is a redirect rather than a page, and listing it
 * would only offer crawlers a URL that resolves to one already here.
 *
 * There is no `lastModified`: the pages are prerendered at build time, so the
 * only date this file could honestly report is the build's, and a date that
 * changes on every deploy without the content changing is worse than no date at
 * all — Google treats an unreliable `lastmod` as a reason to ignore it.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return localizedPages.flatMap((page) => {
    /*
     * Every entry declares the whole set, itself included: each locale is the
     * same page in another language, and the protocol asks each URL in such a
     * group to name all of them.
     */
    const languages = Object.fromEntries(
      locales.map((locale) => [locale, `${siteUrl}/${locale}${page}`]),
    );

    return locales.map((locale) => ({
      url: `${siteUrl}/${locale}${page}`,
      alternates: { languages },
    }));
  });
}
