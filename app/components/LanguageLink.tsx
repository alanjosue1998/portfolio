"use client";

import { usePathname } from "next/navigation";

type Props = {
  locale: string;
  label: string;
  className: string;
};

/**
 * The same page in another language: `/es/cv` becomes `/en/cv`, not `/en`.
 *
 * A Client Component only for `usePathname`, because it renders from the root
 * layout, which is shared by every page and is not told which one it is in.
 * The path is known when each page is prerendered, so the right `href` is in
 * the HTML from the start — no JavaScript is needed to follow it.
 *
 * Still a plain anchor rather than `next/link`, for the reason `CornerControls`
 * gives.
 */
export default function LanguageLink({ locale, label, className }: Props) {
  const pathname = usePathname();
  // Everything after the current locale segment: "" on the home page.
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <a
      href={rest ? `/${locale}/${rest}` : `/${locale}`}
      hrefLang={locale}
      // Starts with the visible text, so a voice-control user saying "click
      // EN" reaches it (WCAG 2.5.3, Label in Name).
      aria-label={`${locale.toUpperCase()} — ${label}`}
      className={className}
    >
      {locale}
    </a>
  );
}
