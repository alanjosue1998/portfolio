import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

export default async function About() {
  const [dict, locale, profile] = await Promise.all([
    getDictionary(),
    lang(),
    prisma.profile.findUnique({ where: { id: "main" } }),
  ]);

  /**
   * Spanish is the default locale, so it is the branch anything unrecognised
   * lands on. An empty column falls back to the paragraph the site shipped
   * with: the admin leaving the field blank means "keep what was there", not
   * "empty the section".
   *
   * The heading stays in the dictionary. It is the name of the section rather
   * than something written, and nothing is gained by making it editable.
   */
  const written = (locale === "en" ? profile?.aboutEn : profile?.aboutEs)?.trim();

  return (
    /**
     * The portrait on the map links here. `scroll-mt-8` keeps the heading from
     * landing flush against the top of the viewport once the scroll finishes.
     */
    <section id="about" className="scroll-mt-8">
      <h2>{dict.about.heading}</h2>
      {/* `whitespace-pre-line` so the blank lines typed into the admin's
          textarea survive as paragraph breaks instead of collapsing. */}
      <p className="whitespace-pre-line">{written || dict.about.body}</p>
    </section>
  );
}
