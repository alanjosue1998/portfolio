export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Picks the best supported locale from an `Accept-Language` header, highest
 * quality value first. Region subtags are ignored, so `en-GB` matches `en`.
 *
 * Shared by `proxy.ts`, which uses it to send `/` to a locale, and by the
 * admin panel, which uses it until a language has been chosen there.
 */
export function matchLocale(header: string | null): Locale {
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

/**
 * Open Graph wants a territory as well as a language (`es_EC`, not `es`).
 * Spanish is Ecuador's, where the work is based; English has no such anchor,
 * and `en_US` is what the networks reading these tags expect by default.
 */
export const openGraphLocales: Record<Locale, string> = {
  es: "es_EC",
  en: "en_US",
};

/**
 * Picks a stored text for the page's language. Content typed in the admin has
 * a Spanish field and an optional English one (`roleEn`, `titleEn`…); English
 * pages use the English text when there is some and fall back to the Spanish,
 * so a translation not written yet shows the original rather than nothing.
 */
export function localized<T extends string | null>(
  locale: string | undefined,
  es: T,
  en: string | null | undefined,
): T | string {
  return locale === "en" && en?.trim() ? en : es;
}
