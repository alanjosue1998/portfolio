import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, localized } from "@/lib/i18n";
import prisma from "@/lib/prisma";

import SectionHeading from "./SectionHeading";

/**
 * Where I have worked, at a glance: role, company and dates, nothing more. The
 * descriptions and the technologies are the CV's job, and the link at the end
 * goes there — repeated here they would turn the home page into the CV with a
 * map on top.
 */
export default async function Experience() {
  const [dict, locale, jobs] = await Promise.all([
    getDictionary(),
    lang(),
    // The CV's order, so the two pages never disagree about it.
    prisma.experience.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
  ]);

  // A heading over an empty list says less than nothing.
  if (jobs.length === 0) return null;

  /**
   * Short months — "ene 2023" — where the CV spells them out. A row here is one
   * line on a phone, and "septiembre de 2021 – actualidad" alone would not be.
   * UTC because that is how the admin stores the month; see `parseMonth`.
   */
  const month = new Intl.DateTimeFormat(locale ?? defaultLocale, {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading>{dict.experience.heading}</SectionHeading>

      {/*
        A list with a rule down its left edge rather than cards: the jobs are a
        sequence, and the line is what says so. Each dot sits on the line, level
        with the role.
      */}
      <ol className="flex flex-col gap-6 border-l border-border pl-6">
        {jobs.map((job) => (
          <li key={job.id} className="relative flex flex-col gap-0.5">
            <span
              aria-hidden="true"
              className="absolute top-2 -left-[calc(1.5rem+4.5px)] size-2 rounded-full bg-accent"
            />

            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-semibold">{localized(locale, job.role, job.roleEn)}</h3>
              <p className="text-sm text-muted tabular-nums">
                {month.format(job.startedAt)} –{" "}
                {job.endedAt ? month.format(job.endedAt) : dict.experience.present}
              </p>
            </div>

            <p className="text-muted">
              {job.companyUrl ? (
                <a
                  href={job.companyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-border underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {job.company}
                </a>
              ) : (
                job.company
              )}
            </p>
          </li>
        ))}
      </ol>

      {/* A plain anchor, like the bar's, so the chosen theme survives the trip. */}
      <a
        href={`/${locale}/cv`}
        className="self-start text-sm font-semibold text-accent underline-offset-4 hover:text-accent-strong hover:underline"
      >
        {dict.experience.more} →
      </a>
    </section>
  );
}
