import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { locales } from "@/lib/i18n";

import { CONTROL } from "./control";
import LanguageLink from "./LanguageLink";
import ThemeToggle from "./ThemeToggle";

/**
 * The two controls that follow the page: the language, and the theme.
 *
 * They sit in the corner rather than in a header because neither is part of the
 * page — the map is what opens it. That also retired the hamburger menu they
 * used to hide behind, which was a Client Component with open/close state
 * wrapped around two links.
 *
 * Only the languages the visitor is *not* reading get a button, built from
 * `locales`, so a third one added in `lib/i18n.ts` arrives as a third button
 * rather than as a rewrite of this file.
 */
export default async function CornerControls() {
  const [dict, current] = await Promise.all([getDictionary(), lang()]);
  const others = locales.filter((locale) => locale !== current);

  return (
    <div className="no-print fixed right-4 bottom-4 z-20 flex flex-col items-center gap-2 sm:right-6 sm:bottom-6">
      <nav aria-label={dict.languages.label}>
        <ul className="flex flex-col items-center gap-2">
          {others.map((locale) => (
            <li key={locale}>
              {/*
               * A plain anchor, not `next/link`, and deliberately so.
               *
               * `[lang]` is a root param, so each locale has its own instance of
               * the root layout. Reaching the other one through a client-side
               * navigation makes React reconcile <html> against the server's
               * version of it, which wipes the `data-theme` attribute
               * `ThemeScript` wrote before the first paint — the chosen theme
               * would silently revert on every language switch. A full document
               * load runs that script again, ahead of the paint, so the theme
               * survives. Nothing is lost by it: both locales are prerendered,
               * and switching language is a once-a-visit act.
               *
               * It also means no JavaScript is needed to change language, and a
               * crawler follows it like any other link. `LanguageLink` keeps the
               * page: from `/es/cv` it goes to `/en/cv`.
               */}
              <LanguageLink
                locale={locale}
                label={dict.languages.switchTo[locale]}
                className={`${CONTROL} text-[13px] font-semibold tracking-wide uppercase`}
              />
            </li>
          ))}
        </ul>
      </nav>

      <ThemeToggle labels={dict.theme} className={CONTROL} />
    </div>
  );
}
