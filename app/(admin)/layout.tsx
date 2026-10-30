import type { Metadata } from "next";

import ThemeScript from "@/app/components/ThemeScript";
import { geistMono, geistSans } from "@/app/fonts";
import { getAdminDictionary, getAdminLocale } from "@/lib/admin-i18n";

import AdminControls from "./AdminControls";

import "../globals.css";

export { viewport } from "@/lib/viewport";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getAdminDictionary();

  return {
    title: dict.meta.title,
    // Private tooling: keep it out of search results.
    robots: { index: false, follow: false },
  };
}

/**
 * A second root layout, alongside `app/[lang]/layout.tsx`. The panel stays
 * outside the `[lang]` segment so its addresses do not change with the
 * language; which one it speaks comes from a cookie — see `lib/admin-i18n.ts` —
 * and that is what sets `lang` here.
 *
 * The theme works as it does on the public site: `ThemeScript` restores a saved
 * choice before the first paint, and with none the system setting decides. The
 * panel's colours all come from the tokens in `app/globals.css`, so both themes
 * hold up.
 *
 * `pb-28` keeps the last thing on a page clear of `AdminControls`, which float
 * over the bottom-right corner.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={await getAdminLocale()}
      /**
       * `ThemeScript` sets `data-theme` here before React hydrates, so the
       * attribute is on the element but not in the server HTML. Expected, and
       * only this element's own attributes are exempted — not its children.
       */
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col pb-28">
        {children}
        <AdminControls />
      </body>
    </html>
  );
}
