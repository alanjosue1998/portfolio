import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import ProjectForm from "./ProjectForm";
import { deleteProject, signOut } from "./actions";

export default async function AdminPage() {
  // Redirects to /login when there is no valid session.
  const session = await requireSession();

  const projects = await prisma.project.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-10 p-8">
      <header className="flex items-baseline justify-between gap-4">
        <h1 className="text-2xl font-semibold">Proyectos</h1>
        <form action={signOut}>
          <span className="mr-3 text-sm text-gray-500">{session.user.email}</span>
          <button type="submit" className="text-sm underline">
            Salir
          </button>
        </form>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Añadir uno nuevo</h2>
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
                <div>
                  <p className="text-sm text-gray-500">{project.type}</p>
                  <h3 className="font-semibold">{project.title}</h3>
                  <p>{project.description}</p>
                  {project.technologies.length > 0 && (
                    <p className="text-sm text-gray-500">{project.technologies.join(", ")}</p>
                  )}
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
    </main>
  );
}
