import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import ThemeScript from "@/app/components/ThemeScript";
import { getAdminDictionary, getAdminLocale } from "@/lib/admin-i18n";

import AdminControls from "./AdminControls";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
