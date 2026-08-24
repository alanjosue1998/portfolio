import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { lang } from "next/root-params";

import ThemeScript from "@/app/components/ThemeScript";
import ThemeToggle from "@/app/components/ThemeToggle";
import { spaceGrotesk } from "@/app/fonts";
import { getDictionary } from "@/lib/dictionaries";
import { locales } from "@/lib/i18n";

import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ lang: locale }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const dict = await getDictionary();

  return (
    <html
      lang={await lang()}
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <ThemeScript />
      </head>
      <body className="flex min-h-full flex-col">
        {children}

        {/*
          Pinned to the viewport rather than placed in the page, so it belongs to
          the layout and not to `page.tsx`. Last in the body, which is also last
          in the tab order: a control that follows the page around should not
          stand between a visitor and the page itself.
        */}
        <ThemeToggle labels={dict.theme} />

        {/*
          Vercel's page-view counter. It lives in this layout and not in
          `app/(admin)/layout.tsx`, the site's other root: the panel is a tool
          for one person, and counting my own visits to it would only be
          noise in the numbers for the pages visitors actually reach.

          It does nothing outside a Vercel deployment, so `next dev` and the
          CI build carry it without sending anything anywhere.
        */}
        <Analytics />
      </body>
    </html>
  );
}
