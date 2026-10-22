export const locales = ["es", "en"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "es";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
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
