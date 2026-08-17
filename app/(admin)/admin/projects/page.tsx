import Image from "next/image";

import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import ProjectForm from "../ProjectForm";
import { deleteProject } from "../actions";

export default async function ProjectsPage() {
  await requireSession();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Añadir un proyecto</h2>
        <ProjectForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Publicados ({projects.length})</h2>

        {projects.length === 0 ? (
          <p className="text-gray-500">Todavía no hay ninguno.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {projects.map((project) => (
              <li
                key={project.id}
                className="flex items-start justify-between gap-4 rounded border border-gray-300 p-4"
              >
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
                    <p className="text-sm text-gray-500">{project.type}</p>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p>{project.description}</p>
                    {project.technologies.length > 0 && (
                      <p className="text-sm text-gray-500">{project.technologies.join(", ")}</p>
                    )}
                  </div>
                </div>

                <form action={deleteProject}>
                  <input type="hidden" name="id" value={project.id} />
                  <button type="submit" className="text-sm text-red-600 underline">
                    Borrar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
