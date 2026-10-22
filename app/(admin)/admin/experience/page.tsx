import { fill, getAdminDictionary, getAdminLocale } from "@/lib/admin-i18n";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import ExperienceForm from "../ExperienceForm";
import DeleteButton from "../DeleteButton";
import EditDialog from "../EditDialog";
import { deleteExperience } from "../actions";
import { ITEM } from "../form-ui";

export default async function ExperiencePage() {
  await requireSession();

  const [dict, locale, jobs] = await Promise.all([
    getAdminDictionary(),
    getAdminLocale(),
    prisma.experience.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  /** Month and year, in the panel's language. */
  const month = new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">{dict.experience.add}</h2>
        <ExperienceForm t={dict.experienceForm} common={dict.common} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          {dict.experience.published} ({jobs.length})
        </h2>

        {jobs.length === 0 ? (
          <p className="text-muted">{dict.experience.empty}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {jobs.map((job) => (
              <li key={job.id} className={ITEM}>
                <div className="min-w-0">
                  <p className="text-sm text-muted">
                    {job.company}
                    {job.location && ` · ${job.location}`} · {month.format(job.startedAt)} –{" "}
                    {job.endedAt ? month.format(job.endedAt) : dict.experience.ongoing}
                  </p>
                  <h3 className="font-semibold">
                    {job.role}
                    {job.roleEn && (
                      <span lang="en" className="font-normal text-muted">
                        {" "}
                        · EN: {job.roleEn}
                      </span>
                    )}
                  </h3>
                  <p className="mt-1 text-sm whitespace-pre-line">{job.description}</p>

                  {job.technologies.length > 0 && (
                    <p className="mt-1 text-sm text-muted">{job.technologies.join(", ")}</p>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <EditDialog
                    trigger={dict.common.edit}
                    title={fill(dict.common.editTitle, { name: job.role })}
                    cancel={dict.common.cancel}
                  >
                    <ExperienceForm t={dict.experienceForm} common={dict.common} initial={job} />
                  </EditDialog>
                  <DeleteButton
                    action={deleteExperience}
                    id={job.id}
                    label={dict.common.delete}
                    confirmation={fill(dict.common.confirmDelete, { name: job.role })}
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
