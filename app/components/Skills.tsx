import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

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
    <section className="flex flex-col gap-6">
      <h2>{dict.skills.heading}</h2>

      <div className="flex flex-col gap-5">
        {[...byCategory].map(([category, group]) => (
          <div key={category} className="flex flex-col gap-2">
            {/*
              A heading rather than a styled paragraph: this is a real level in
              the outline, and a screen reader listing headings should find the
              categories under Skills.
            */}
            <h3 className="text-sm font-semibold tracking-wide text-muted uppercase">{category}</h3>

            <ul className="flex flex-wrap gap-2">
              {group.map((skill) => (
                <li
                  key={skill.id}
                  className="rounded-lg border border-border bg-surface px-3 py-1.5 text-sm"
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
