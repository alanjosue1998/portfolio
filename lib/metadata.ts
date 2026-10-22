import type { Metadata } from "next";

import { locales, openGraphLocales, type Locale } from "@/lib/i18n";

/**
 * The Open Graph and Twitter blocks for one page — what LinkedIn, WhatsApp and
 * Slack read to draw a link preview.
 *
 * A function rather than one block in the layout because Next replaces
 * `openGraph` wholesale rather than merging it: a page that only changed the
 * title would otherwise lose the type, the locale and the URL with it, and the
 * CV would be shared under the home page's address.
 *
 * No `images` here: they come from `opengraph-image.tsx` files by convention,
 * which Next also copies into `twitter:image`. A page that calls this sets its
 * own `openGraph` and so stops inheriting its parent's image — it needs an
 * `opengraph-image.tsx` beside it, as `app/[lang]/cv` has.
 *
 * `url` is relative on purpose — `metadataBase` in `app/[lang]/layout.tsx`
 * makes it absolute.
 */
export function socialMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "profile",
      url: path,
      title,
      description,
      locale: openGraphLocales[locale],
      alternateLocale: locales
        .filter((other) => other !== locale)
        .map((other) => openGraphLocales[other]),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
