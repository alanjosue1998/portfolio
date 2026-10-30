import { fill, getAdminDictionary } from "@/lib/admin-i18n";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import SkillForm from "../SkillForm";
import DeleteButton from "../DeleteButton";
import EditDialog from "../EditDialog";
import { deleteSkill } from "../actions";

export default async function SkillsPage() {
  await requireSession();

  const [dict, skills] = await Promise.all([
    getAdminDictionary(),
    prisma.skill.findMany({
      // Same order as the public section, so this list shows what the site does.
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

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
        <h2 className="text-lg font-semibold">{dict.skills.add}</h2>
        <SkillForm categories={[...byCategory.keys()]} t={dict.skillForm} common={dict.common} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          {dict.skills.published} ({skills.length})
        </h2>

        {skills.length === 0 ? (
          <p className="text-muted">{dict.skills.empty}</p>
        ) : (
          <div className="flex flex-col gap-6">
            {[...byCategory].map(([category, group]) => (
              <div key={category} className="flex flex-col gap-2">
                <h3 className="text-sm font-semibold text-muted uppercase">{category}</h3>

                <ul className="flex flex-col gap-2">
                  {group.map((skill) => (
                    <li
                      key={skill.id}
                      className="flex items-center justify-between gap-4 rounded border border-border px-3 py-2"
                    >
                      <span>
                        {skill.name}
                        {skill.nameEn && (
                          <span lang="en" className="text-muted">
                            {" "}
                            · EN: {skill.nameEn}
                          </span>
                        )}{" "}
                        <span className="text-sm text-muted">
                          ({dict.skills.order} {skill.position})
                        </span>
                      </span>

                      <div className="flex shrink-0 items-center gap-4">
                        <EditDialog
                          trigger={dict.common.edit}
                          title={fill(dict.common.editTitle, { name: skill.name })}
                          cancel={dict.common.cancel}
                        >
                          <SkillForm
                            categories={[...byCategory.keys()]}
                            t={dict.skillForm}
                            common={dict.common}
                            initial={skill}
                          />
                        </EditDialog>
                        <DeleteButton
                          action={deleteSkill}
                          id={skill.id}
                          label={dict.common.delete}
                          confirmation={fill(dict.common.confirmDelete, { name: skill.name })}
                          name={skill.name}
                        />
                      </div>
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
