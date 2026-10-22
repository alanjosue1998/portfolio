import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { localized } from "@/lib/i18n";
import prisma from "@/lib/prisma";

import SectionHeading from "./SectionHeading";

export default async function Skills() {
  const [dict, locale, skills] = await Promise.all([
    getDictionary(),
    lang(),
    /**
     * `position` orders the whole list, not just within a group. Because the
     * grouping below keeps the order the rows arrive in, a category surfaces
     * wherever its first skill sits — so one number in the admin controls both
     * which category comes first and the order inside it.
     */
    prisma.skill.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
  ]);

  // A heading over an empty list says less than nothing.
  if (skills.length === 0) return null;

  /**
   * Grouped by the Spanish category, which is the one every skill has, and
   * headed by its English name on `/en` — taken from whichever skill in the
   * group has one, since it only needs typing once per category.
   */
  const byCategory = new Map<string, { label: string; skills: typeof skills }>();

  for (const skill of skills) {
    const group = byCategory.get(skill.category) ?? { label: skill.category, skills: [] };
    group.skills.push(skill);
    group.label = localized(locale, group.label, skill.categoryEn);
    byCategory.set(skill.category, group);
  }

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading>{dict.skills.heading}</SectionHeading>

      {/* A card per category, as many to a row as fit at 220px each. */}
      <div className="grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
        {[...byCategory].map(([category, group]) => (
          <div
            key={category}
            className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-5"
          >
            {/*
              A heading rather than a styled paragraph: this is a real level in
              the outline, and a screen reader listing headings should find the
              categories under Skills.
            */}
            <h3 className="font-sans text-xs font-semibold tracking-[0.08em] text-muted uppercase">
              {group.label}
            </h3>

            <ul className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-strong"
                >
                  {localized(locale, skill.name, skill.nameEn)}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
