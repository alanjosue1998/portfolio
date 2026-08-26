import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Panel",
  // Private tooling: keep it out of search results.
  robots: { index: false, follow: false },
};

/**
 * A second root layout, alongside `app/[lang]/layout.tsx`. The panel is a tool
 * for one person, so it stays outside the `[lang]` segment and out of the
 * translation files — which is also why this file, not `lang()`, decides the
 * language of the document.
 *
 * It also decides the theme, by pinning `data-theme` to `light` rather than
 * leaving the attribute off and letting `prefers-color-scheme` answer. The
 * panel renders no `ThemeToggle`, so the system setting would be the whole say;
 * forms read better on a light ground, and an uploaded photo should be judged
 * against the one the public card paints it on. `app/globals.css` guards its
 * dark rules as `:root:not([data-theme="light"])`, so this wins on its own —
 * and deliberately without `ThemeScript`, which restores a choice from storage
 * that the panel never offers.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es"
      data-theme="light"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
