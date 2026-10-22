import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { loadDictionary } from "@/lib/dictionaries";
import { isLocale, defaultLocale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

/**
 * The card a shared link unfurls into, drawn at build time — one per locale,
 * since `[lang]` is prerendered — so it can never drift from the dictionary the
 * way a PNG checked into the repo would.
 *
 * File convention: it attaches to the pages in this segment. A page below that
 * sets its own `openGraph` loses it and needs a file of its own — see
 * `cv/opengraph-image.tsx`, which re-exports this one.
 */

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The site's own palette, light theme. Copied rather than read from
 * `globals.css`: the image is rendered by Satori, which knows nothing of CSS
 * custom properties.
 */
const palette = {
  background: "#faf7f2",
  foreground: "#1c1917",
  accent: "#b45309",
  muted: "#6b645e",
  border: "#e7e5e4",
};

/**
 * Space Grotesk as TTF, converted from the `.woff2` files `app/fonts.ts` serves
 * to browsers: `ImageResponse` reads TTF, OTF and WOFF, but not WOFF2. Read
 * once at module scope — the files do not change between the two locales.
 */
const fonts = Promise.all([
  readFile(join(process.cwd(), "app/fonts/SpaceGrotesk-Regular.ttf")),
  readFile(join(process.cwd(), "app/fonts/SpaceGrotesk-Medium.ttf")),
]);

/**
 * `generateImageMetadata` rather than a fixed `alt` export, so the alt text is
 * in the language of the page that carries it. The locale comes from `params`:
 * `next/root-params` does not reach image routes.
 */
export async function generateImageMetadata({ params }: { params: { lang: string } }) {
  const dict = await loadDictionary(isLocale(params.lang) ? params.lang : defaultLocale);

  return [{ id: "card", size, contentType, alt: `${dict.cv.name} — ${dict.hero.role}` }];
}

export default async function OpenGraphImage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const [dict, [regular, medium]] = await Promise.all([
    loadDictionary(isLocale(lang) ? lang : defaultLocale),
    fonts,
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px 80px",
        background: palette.background,
        color: palette.foreground,
        fontFamily: "Space Grotesk",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 28 }}>
        {/* The same hairline the section headings run out to. */}
        <div style={{ width: 48, height: 4, background: palette.accent }} />
        <span style={{ color: palette.muted }}>
          {dict.location.city}, {dict.location.country}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 76, fontWeight: 500, lineHeight: 1.05, letterSpacing: -1.5 }}>
          {dict.cv.name}
        </div>
        {/* Role and tagline on lines of their own: on one, the Spanish role
            ran the tagline off the edge of the card. */}
        <div style={{ display: "flex", flexDirection: "column", fontSize: 38, lineHeight: 1.3 }}>
          <span>{dict.hero.role}</span>
          <span style={{ color: palette.accent, fontWeight: 500 }}>{dict.hero.tagline}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          paddingTop: 28,
          borderTop: `2px solid ${palette.border}`,
          fontSize: 26,
          color: palette.muted,
        }}
      >
        {new URL(siteUrl).host}
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: regular, weight: 400, style: "normal" },
        { name: "Space Grotesk", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
