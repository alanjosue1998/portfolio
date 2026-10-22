import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import EducationForm from "../EducationForm";
import { deleteEducation } from "../actions";

/** Month and year, in the language the admin itself is written in. */
const month = new Intl.DateTimeFormat("es", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

export default async function EducationPage() {
  await requireSession();

  const studies = await prisma.education.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Añadir educación</h2>
        <EducationForm />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Publicadas ({studies.length})</h2>

        {studies.length === 0 ? (
          <p className="text-gray-500">Todavía no hay ninguna.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {studies.map((study) => (
              <li
                key={study.id}
                className="flex items-start justify-between gap-4 rounded border border-gray-300 p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">
                    {study.institution} · {month.format(study.startedAt)} –{" "}
                    {study.endedAt ? month.format(study.endedAt) : "en curso"}
                  </p>
                  <h3 className="font-semibold">{study.degree}</h3>
                </div>

                <form action={deleteEducation}>
                  <input type="hidden" name="id" value={study.id} />
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
