import localFont from "next/font/local";

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
