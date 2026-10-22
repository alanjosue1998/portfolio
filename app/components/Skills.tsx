import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

import SectionHeading from "./SectionHeading";

export default async function Skills() {
  const [dict, skills] = await Promise.all([
    getDictionary(),
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

  const byCategory = new Map<string, typeof skills>();

  for (const skill of skills) {
    const group = byCategory.get(skill.category) ?? [];
    group.push(skill);
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
              {category}
            </h3>

            <ul className="flex flex-wrap gap-2">
              {group.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-full bg-accent-soft px-3 py-1.5 text-sm font-medium text-accent-strong"
                >
                  {skill.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
