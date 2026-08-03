import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

export default async function Projects() {
  const [dict, projects] = await Promise.all([
    getDictionary(),
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return (
    <section>
      <h2>{dict.projects.heading}</h2>
      <div>
        {projects.map((project) => (
          <article key={project.id}>
            <p>
              {dict.projects.typeLabel}: {project.type}
            </p>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <p>{project.technologies.join(", ")}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
