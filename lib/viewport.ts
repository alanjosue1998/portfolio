import type { Viewport } from "next";

/**
 * The colour mobile browsers paint their own toolbar in, so it runs into the
 * page instead of sitting on it as a white bar. The two values are
 * `--background` from `app/globals.css`, one per theme.
 *
 * Shared by both root layouts, so the two cannot disagree. It follows the system
 * setting only: a theme chosen with the toggle changes `data-theme`, which a
 * `media` query on the tag cannot see.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1512" },
  ],
};
