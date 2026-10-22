import type { Metadata } from "next";

import { defaultLocale, locales, openGraphLocales, type Locale } from "@/lib/i18n";

/**
 * Every page that exists once per locale, as the path after the locale. The
 * sitemap lists each of them in every language, and `pageMetadata` links each
 * one to its translations.
 */
export const localizedPages = ["", "/cv"] as const;

export type LocalizedPage = (typeof localizedPages)[number];

/**
 * The per-page metadata that depends on where the page sits: its canonical URL
 * and translations, and the Open Graph and Twitter blocks — what LinkedIn,
 * WhatsApp and Slack read to draw a link preview.
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
 * URLs are relative on purpose — `metadataBase` in `app/[lang]/layout.tsx`
 * makes them absolute.
 */
export function pageMetadata({
  locale,
  page,
  title,
  description,
}: {
  locale: Locale;
  /** The path after the locale: `""` for the home page, `"/cv"` for the CV. */
  page: LocalizedPage;
  title: string;
  description: string;
}): Pick<Metadata, "openGraph" | "twitter" | "alternates"> {
  const path = `/${locale}${page}`;

  return {
    /**
     * `hreflang` for search engines: the same page in each language, so a
     * Spanish search lands on `/es/…` and an English one on `/en/…` rather
     * than either being treated as a duplicate of the other. `x-default` is the
     * default locale, the one `proxy.ts` falls back to.
     */
    alternates: {
      canonical: path,
      languages: {
        ...Object.fromEntries(locales.map((other) => [other, `/${other}${page}`])),
        "x-default": `/${defaultLocale}${page}`,
      },
    },
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
