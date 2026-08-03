import Link from "next/link";
import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { locales } from "@/lib/i18n";

export default async function LanguageSwitcher() {
  const [dict, current] = await Promise.all([getDictionary(), lang()]);

  return (
    <nav aria-label={dict.languages.label}>
      <ul>
        {locales.map((locale) => (
          <li key={locale}>
            <Link
              href={`/${locale}`}
              hrefLang={locale}
              aria-current={locale === current ? "page" : undefined}
            >
              {dict.languages[locale]}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
