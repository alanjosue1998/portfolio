import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

/**
 * Geist and Geist Mono, shared by both root layouts — `app/[lang]/layout.tsx`
 * and `app/(admin)/layout.tsx` — so the two cannot drift apart on subsets or
 * `display`. Each layout still picks which variables go on its `<html>`.
 */
export const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * Space Grotesk, self-hosted from `app/fonts` rather than fetched from Google.
 * The two weights are the only ones the site uses; the family also ships Light
 * and Bold, which would be dead bytes here.
 *
 * The files and their licence come from the project's own repository — see
 * `app/fonts/OFL.txt`, which the SIL Open Font License requires be distributed
 * alongside them.
 */
export const spaceGrotesk = localFont({
  src: [
    { path: "./fonts/SpaceGrotesk-Regular.woff2", weight: "400" },
    { path: "./fonts/SpaceGrotesk-Medium.woff2", weight: "500" },
  ],
  variable: "--font-display",
});
