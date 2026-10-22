"use server";

import { cookies } from "next/headers";

import { ADMIN_LOCALE_COOKIE } from "@/lib/admin-i18n";
import { isLocale } from "@/lib/i18n";

/**
 * Switches the panel's language. Not behind `requireSession`: the login page
 * needs it too, and all it can do is set a cookie on the caller's own browser,
 * to one of two values.
 *
 * Setting a cookie in a Server Action re-renders the current route, so the page
 * comes back in the new language without a redirect.
 */
export async function setAdminLocale(formData: FormData) {
  const locale = String(formData.get("locale") ?? "");

  if (!isLocale(locale)) return;

  (await cookies()).set(ADMIN_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });
}
