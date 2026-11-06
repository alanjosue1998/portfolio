"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { geistMono, geistSans, spaceGrotesk } from "@/app/fonts";
import { errorCopy } from "@/lib/error-copy";
import { defaultLocale, isLocale } from "@/lib/i18n";

import { THEME_IDS, themeCss } from "./components/themes";

import "./globals.css";

/**
 * The last resort, for when a root layout itself throws. It replaces the whole
 * document, so it brings its own `<html>`, `<body>`, stylesheet, fonts and
 * theme — nothing from `app/[lang]/layout.tsx` reaches it.
 *
 * The locale comes from the path, since there is no layout left to read it
 * from; anything else, the admin included, gets the default one.
 *
 * The theme's palettes are inlined as in `ThemeScript`, but its script cannot
 * run from here — React does not execute a `<script>` it renders on the
 * client — so a theme picked by hand is applied after mount instead. Until
 * then the page follows the system setting, which is what the CSS alone does.
 */
export default function GlobalError({ error, retry }: { error: unknown; retry: () => void }) {
  const segment = usePathname()?.split("/")[1] ?? "";
  const locale = isLocale(segment) ? segment : defaultLocale;
  const copy = errorCopy[locale];

  useEffect(() => {
    console.error(error);

    try {
      const theme = localStorage.getItem("theme");
      if (theme && (THEME_IDS as readonly string[]).includes(theme)) {
        document.documentElement.dataset.theme = theme;
      }
    } catch {
      // Storage blocked: the system setting stays in charge.
    }
  }, [error]);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <title>{copy.title}</title>
        <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      </head>
      <body className="flex min-h-full flex-col">
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-4 py-24 sm:px-6">
          <h1 className="text-3xl leading-tight tracking-tight sm:text-4xl">{copy.heading}</h1>
          <p className="max-w-[44ch] text-muted">{copy.body}</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => retry()}
              className="inline-flex h-11 items-center rounded-[10px] bg-accent px-[18px] font-semibold text-on-accent transition-colors hover:bg-accent-strong"
            >
              {copy.retry}
            </button>
            <a
              href={`/${locale}`}
              className="inline-flex h-11 items-center rounded-[10px] border border-border bg-surface px-[18px] font-semibold text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {copy.home}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
