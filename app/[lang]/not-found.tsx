import type { Metadata } from "next";
import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return { title: dict.notFound.title };
}

/**
 * The site's own 404, inside the `[lang]` layout, so it has the fonts, the
 * theme and the corner controls, and speaks the visitor's language. Next adds
 * `noindex` and the 404 status on its own.
 *
 * A plain anchor home rather than `Link`: the visitor is leaving a page that
 * failed, and a full load is the cleanest start.
 */
export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), lang()]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-4 py-24 sm:px-6">
      <p className="font-mono text-sm text-accent">404</p>
      <h1 className="text-3xl leading-tight tracking-tight sm:text-4xl">{dict.notFound.heading}</h1>
      <p className="max-w-[44ch] text-muted">{dict.notFound.body}</p>
      <a
        href={`/${locale}`}
        className="inline-flex h-11 w-fit items-center rounded-[10px] bg-accent px-[18px] font-semibold text-on-accent transition-colors hover:bg-accent-strong"
      >
        {dict.notFound.home}
      </a>
    </main>
  );
}
