import Image from "next/image";

import { fill, getAdminDictionary } from "@/lib/admin-i18n";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import ProjectForm from "../ProjectForm";
import DeleteButton from "../DeleteButton";
import EditDialog from "../EditDialog";
import { deleteProject } from "../actions";
import { ITEM } from "../form-ui";

export default async function ProjectsPage() {
  await requireSession();

  const [dict, projects] = await Promise.all([
    getAdminDictionary(),
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{dict.projects.add}</h2>
        <ProjectForm t={dict.projectForm} common={dict.common} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          {dict.projects.published} ({projects.length})
        </h2>

        {projects.length === 0 ? (
          <p className="text-muted">{dict.projects.empty}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {projects.map((project) => (
              <li key={project.id} className={ITEM}>
                <div className="flex min-w-0 gap-4">
                  {project.imageUrl && (
                    <Image
                      src={project.imageUrl}
                      alt=""
                      width={80}
                      height={80}
                      className="size-20 shrink-0 rounded object-cover"
                    />
                  )}

                  <div className="min-w-0">
                    <p className="text-sm text-muted">{project.type}</p>
                    <h3 className="font-semibold">
                      {project.title}
                      {project.titleEn && (
                        <span lang="en" className="font-normal text-muted">
                          {" "}
                          · EN: {project.titleEn}
                        </span>
                      )}
                    </h3>
                    <p>{project.description}</p>
                    {project.technologies.length > 0 && (
                      <p className="text-sm text-muted">{project.technologies.join(", ")}</p>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <EditDialog
                    trigger={dict.common.edit}
                    title={fill(dict.common.editTitle, { name: project.title })}
                    cancel={dict.common.cancel}
                  >
                    <ProjectForm t={dict.projectForm} common={dict.common} initial={project} />
                  </EditDialog>
                  <DeleteButton
                    action={deleteProject}
                    id={project.id}
                    label={dict.common.delete}
                    confirmation={fill(dict.common.confirmDelete, { name: project.title })}
                    name={project.title}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
