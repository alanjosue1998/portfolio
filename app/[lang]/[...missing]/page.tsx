import { notFound } from "next/navigation";

/**
 * Catches every path under a locale that no page answers — `/es/whatever` —
 * and hands it to `app/[lang]/not-found.tsx`. Without it an unmatched path
 * never enters the `[lang]` tree, and the visitor gets Next's stock 404: no
 * typeface, no palette, no way back, and in English on the Spanish site.
 *
 * `proxy.ts` sends any path without a locale to one first, so this is where
 * every mistyped link on the public site ends up.
 */
export default function Missing() {
  notFound();
}
