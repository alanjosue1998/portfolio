import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import SkillForm from "../SkillForm";
import { deleteSkill } from "../actions";

export default async function SkillsPage() {
  await requireSession();

  const skills = await prisma.skill.findMany({
    // Same order as the public section, so this list shows what the site does.
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  /**
   * Grouped here rather than in the query: Prisma would need a second round
   * trip to return them nested, and the list is small enough that a pass over
   * it costs nothing. The public `Skills` component groups the same way.
   */
  const byCategory = new Map<string, typeof skills>();

  for (const skill of skills) {
    const group = byCategory.get(skill.category) ?? [];
    group.push(skill);
    byCategory.set(skill.category, group);
  }

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Añadir una skill</h2>
        <SkillForm categories={[...byCategory.keys()]} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Publicadas ({skills.length})</h2>

        {skills.length === 0 ? (
          <p className="text-gray-500">Todavía no hay ninguna.</p>
        ) : (
          <div className="flex flex-col gap-6">
            {[...byCategory].map(([category, group]) => (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-gray-500 uppercase">{category}</h3>

                <ul className="flex flex-col gap-2">
                  {group.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex items-center justify-between gap-4 rounded border border-gray-300 px-3 py-2"
                    >
                      <span>
                        {skill.name}{" "}
                        <span className="text-sm text-gray-500">(orden {skill.position})</span>
                      </span>

                      <form action={deleteSkill}>
                        <input type="hidden" name="id" value={skill.id} />
                        <button type="submit" className="text-sm text-red-600 underline">
                          Borrar
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
