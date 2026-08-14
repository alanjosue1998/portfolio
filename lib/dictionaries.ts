import { notFound } from "next/navigation";
import { lang } from "next/root-params";

import { isLocale } from "@/lib/i18n";

const loaders = {
  es: () => import("@/dictionaries/es.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

/**
 * The shape of a dictionary, derived from the Spanish one. Because
 * `getDictionary` is annotated with it, a translation file that drifts out of
 * shape is a type error rather than a runtime surprise.
 */
export type Dictionary = Awaited<ReturnType<typeof loaders.es>>;

/**
 * Reads the locale from the `[lang]` root segment, so callers never pass it in
 * and it never has to be drilled through props. It comes back undefined under
 * the second root layout, `app/(admin)`, which has no `[lang]` segment.
 */
export async function getDictionary(): Promise<Dictionary> {
  const locale = await lang();

  if (!locale || !isLocale(locale)) notFound();

  return loaders[locale]();
}
