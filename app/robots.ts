import type { MetadataRoute } from "next";

import { siteUrl } from "@/lib/site";

/**
 * `app/(admin)/layout.tsx` already asks not to be indexed through its metadata,
 * but that tag only exists once the page has been rendered — and `/admin`
 * redirects to `/login` for anyone without a session, so a crawler would never
 * get that far. Saying it here means the crawler never makes the request.
 *
 * Both paths are prefixes: `Disallow: /admin` covers everything under it.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/login"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
