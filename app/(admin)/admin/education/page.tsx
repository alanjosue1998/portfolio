import { fill, getAdminDictionary, getAdminLocale } from "@/lib/admin-i18n";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import EducationForm from "../EducationForm";
import DeleteButton from "../DeleteButton";
import EditDialog from "../EditDialog";
import { deleteEducation } from "../actions";
import { ITEM } from "../form-ui";

export default async function EducationPage() {
  await requireSession();

  const [dict, locale, studies] = await Promise.all([
    getAdminDictionary(),
    getAdminLocale(),
    prisma.education.findMany({
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
        <h2 className="text-lg font-semibold">{dict.education.add}</h2>
        <EducationForm t={dict.educationForm} common={dict.common} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">
          {dict.education.published} ({studies.length})
        </h2>

        {studies.length === 0 ? (
          <p className="text-muted">{dict.education.empty}</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {studies.map((study) => (
              <li key={study.id} className={ITEM}>
                <div className="min-w-0">
                  <p className="text-sm text-muted">
                    {study.institution} · {month.format(study.startedAt)} –{" "}
                    {study.endedAt ? month.format(study.endedAt) : dict.education.ongoing}
                  </p>
                  <h3 className="font-semibold">
                    {study.degree}
                    {study.degreeEn && (
                      <span lang="en" className="font-normal text-muted">
                        {" "}
                        · EN: {study.degreeEn}
                      </span>
                    )}
                  </h3>
                </div>

                <div className="flex shrink-0 items-center gap-4">
                  <EditDialog
                    trigger={dict.common.edit}
                    title={fill(dict.common.editTitle, { name: study.degree })}
                    cancel={dict.common.cancel}
                  >
                    <EducationForm t={dict.educationForm} common={dict.common} initial={study} />
                  </EditDialog>
                  <DeleteButton
                    action={deleteEducation}
                    id={study.id}
                    label={dict.common.delete}
                    confirmation={fill(dict.common.confirmDelete, { name: study.degree })}
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
