import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import ExperienceForm from "../ExperienceForm";
import { deleteExperience } from "../actions";

/** Month and year, in the language the admin itself is written in. */
const month = new Intl.DateTimeFormat("es", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function ExperiencePage() {
  await requireSession();

  const jobs = await prisma.experience.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Añadir experiencia</h2>
        <ExperienceForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Publicadas ({jobs.length})</h2>

        {jobs.length === 0 ? (
          <p className="text-gray-500">Todavía no hay ninguna.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {jobs.map((job) => (
              <li
                key={job.id}
                className="flex items-start justify-between gap-4 rounded border border-gray-300 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    {job.company}
                    {job.location && ` · ${job.location}`} · {month.format(job.startedAt)} –{" "}
                    {job.endedAt ? month.format(job.endedAt) : "actualidad"}
                  </p>
                  <h3 className="font-semibold">{job.role}</h3>
                  <p className="mt-1 text-sm whitespace-pre-line">{job.description}</p>

                  {job.technologies.length > 0 && (
                    <p className="mt-1 text-sm text-gray-500">{job.technologies.join(", ")}</p>
                  )}
                </div>

                <form action={deleteExperience}>
                  <input type="hidden" name="id" value={job.id} />
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
