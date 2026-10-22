import { CONTROL } from "@/app/components/control";
import ThemeToggle from "@/app/components/ThemeToggle";
import { getAdminDictionary, getAdminLocale } from "@/lib/admin-i18n";
import { locales } from "@/lib/i18n";

import { setAdminLocale } from "./locale-actions";

/**
 * The panel's language and theme, in the corner the public site keeps them in
 * and drawn the same way — see `CornerControls`.
 *
 * The language is a form rather than a link: the panel's addresses carry no
 * locale, so switching means setting a cookie, and a Server Action does that
 * with or without JavaScript. The theme is the public site's own toggle; it
 * writes the same `localStorage` key, so a choice made on one side holds on
 * the other.
 */
export default async function AdminControls() {
  const [dict, current] = await Promise.all([getAdminDictionary(), getAdminLocale()]);
  const others = locales.filter((locale) => locale !== current);

  return (
    <div className="fixed right-4 bottom-4 z-20 flex flex-col items-center gap-2 sm:right-6 sm:bottom-6">
      <div role="group" aria-label={dict.controls.label} className="flex flex-col gap-2">
        {others.map((locale) => (
          <form key={locale} action={setAdminLocale}>
            <input type="hidden" name="locale" value={locale} />
            <button
              type="submit"
              lang={locale}
              aria-label={dict.controls.switchTo[locale]}
              className={`${CONTROL} text-[13px] font-semibold tracking-wide uppercase`}
            >
              {locale}
            </button>
          </form>
        ))}
      </div>

      <ThemeToggle labels={dict.controls.theme} className={CONTROL} />
    </div>
  );
}
