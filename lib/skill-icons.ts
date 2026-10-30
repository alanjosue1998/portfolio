import "server-only";

import * as simpleIcons from "simple-icons";

/**
 * The logo for a skill typed in the admin, looked up in Simple Icons (CC0) by
 * name — "JavaScript", "Next.js", "Tailwind CSS" — so a new skill gets its
 * logo without anyone choosing it. Server only: the package carries every
 * brand there is, and only the few paths a page uses should reach it.
 *
 * Names are compared with everything but letters and digits stripped, against
 * both an icon's title and its slug. A name it does not know returns null, and
 * the chip shows a monogram instead.
 */

type Icon = { title: string; slug: string; path: string };

/** Names people type that Simple Icons files under something else. */
const ALIASES: Record<string, string> = {
  css3: "css",
  html: "html5",
  js: "javascript",
  ts: "typescript",
  node: "nodedotjs",
  nodejs: "nodedotjs",
  nextjs: "nextdotjs",
  vue: "vuedotjs",
  vuejs: "vuedotjs",
  postgres: "postgresql",
  tailwind: "tailwindcss",
};

const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const index = new Map<string, Icon>();

for (const icon of Object.values(simpleIcons) as Icon[]) {
  if (!icon?.path) continue;
  index.set(icon.slug, icon);
  // A title never overwrites a slug: the slug is the exact match.
  if (!index.has(normalise(icon.title))) index.set(normalise(icon.title), icon);
}

/** The SVG path of a skill's logo on a 24×24 grid, or null when there is none. */
export function skillIcon(name: string): string | null {
  const key = normalise(name);
  return (index.get(ALIASES[key] ?? key) ?? null)?.path ?? null;
}
