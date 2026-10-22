import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { isLocale, matchLocale, type Locale } from "@/lib/i18n";

/**
 * The panel's language. Not a URL segment like the public site's `[lang]`: the
 * panel lives in its own root layout, `app/(admin)`, and its addresses are the
 * same in either language. The choice is a cookie instead, written by
 * `setAdminLocale` in `app/(admin)/locale-actions.ts`.
 */
export const ADMIN_LOCALE_COOKIE = "admin-locale";

const loaders = {
  es: () => import("@/dictionaries/admin/es.json").then((m) => m.default),
  en: () => import("@/dictionaries/admin/en.json").then((m) => m.default),
};

/**
 * The shape of the panel's dictionary, derived from the Spanish one — the same
 * arrangement as `lib/dictionaries.ts`, so a file that drifts out of shape is a
 * type error.
 */
export type AdminDictionary = Awaited<ReturnType<typeof loaders.es>>;

/**
 * The cookie when there is one; until then, the browser's `Accept-Language`,
 * read the same way `proxy.ts` reads it for the public site. Cached per request
 * because the layout, the page and a Server Action may each ask.
 */
export const getAdminLocale = cache(async (): Promise<Locale> => {
  const chosen = (await cookies()).get(ADMIN_LOCALE_COOKIE)?.value;

  if (chosen && isLocale(chosen)) return chosen;

  return matchLocale((await headers()).get("accept-language"));
});

export async function getAdminDictionary(): Promise<AdminDictionary> {
  return loaders[await getAdminLocale()]();
}

/**
 * Fills `{name}`-style placeholders. The panel's messages need nothing more —
 * no plurals, no formatting — so a library would be dead weight.
 */
export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match);
}
