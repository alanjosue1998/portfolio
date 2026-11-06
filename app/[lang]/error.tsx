"use client";

import { useParams } from "next/navigation";
import { useEffect } from "react";

import { errorCopy } from "@/lib/error-copy";
import { defaultLocale, isLocale } from "@/lib/i18n";

/**
 * Shown when something inside a locale's page throws while rendering — a
 * database that went away during an on-demand revalidation, say. It sits
 * inside the `[lang]` layout, so the page keeps its fonts and theme.
 *
 * `retry` re-renders the segment, which is all a passing failure needs. The
 * error itself is not shown: in production Next replaces a server error's
 * message with a generic one anyway, and the `digest` is what matches it to
 * the server log, so that is what gets logged here.
 */
export default function Error({ error, retry }: { error: unknown; retry: () => void }) {
  const params = useParams<{ lang: string }>();
  const locale = isLocale(params.lang) ? params.lang : defaultLocale;
  const copy = errorCopy[locale];

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-5 px-4 py-24 sm:px-6">
      <title>{copy.title}</title>
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
  );
}
