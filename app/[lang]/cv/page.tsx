import type { Metadata } from "next";
import { lang } from "next/root-params";

import BottomBar, { BAR_ITEM } from "@/app/components/BottomBar";
import CvPrintButton from "@/app/components/CvPrintButton";
import { ArrowLeftIcon } from "@/app/components/icons";
import { getDictionary } from "@/lib/dictionaries";
import { defaultLocale, localized, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import prisma from "@/lib/prisma";

export async function generateMetadata(): Promise<Metadata> {
  const [dict, locale] = await Promise.all([getDictionary(), lang()]);

  /**
   * The title doubles as the PDF's file name: "Save as PDF" proposes the
   * document title, so this is what lands in a recruiter's downloads folder.
   */
  return {
    title: dict.cv.title,
    description: dict.cv.description,
    ...pageMetadata({
      locale: locale as Locale,
      page: "/cv",
      title: dict.cv.title,
      description: dict.cv.description,
    }),
  };
}

/**
 * A contact link as it reads on paper, where it cannot be clicked: the address
 * rather than "Email", the site without its `https://`.
 */
function printable(url: string) {
  if (url.startsWith("mailto:")) return url.slice("mailto:".length);

  return url.replace(/^https:\/\//, "").replace(/\/$/, "");
}

/** The heading every CV section opens with. */
function CvSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-border pb-1.5 text-sm font-semibold tracking-[0.08em] text-accent uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The portfolio as a CV, built from the same rows as the home page and laid
 * out to be printed: `CvPrintButton` opens the print dialog and the
 * `@media print` rules in `app/globals.css` turn the page into an A4 PDF.
 *
 * Prerendered once per locale like the home page, and refreshed by the same
 * `revalidateSite()` in the admin's actions.
 *
 * Everything follows the locale: the headings, labels and dates from the
 * dictionaries, and the rows' own text through `localized()` — each has an
 * optional English column (`roleEn`, `titleEn`…) that `/en/cv` uses, falling
 * back to the Spanish one until it is filled in. Company and institution names
 * stay as written, the way a CV keeps proper names.
 */
export default async function CvPage() {
  const [dict, locale, profile, links, jobs, studies, skills, projects, certificates] =
    await Promise.all([
      getDictionary(),
      lang(),
      prisma.profile.findUnique({ where: { id: "main" } }),
      // A CV that links to the CV says nothing.
      prisma.contactLink.findMany({
        where: { platform: { not: "cv" } },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      }),
      prisma.experience.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
      prisma.education.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
      prisma.skill.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
      // Newest first, the order `Projects` shows them in.
      prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.certificate.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    ]);

  // Same fallback as `About`: a blank column means "keep the shipped text".
  const about = (locale === "en" ? profile?.aboutEn : profile?.aboutEs)?.trim() || dict.about.body;

  /**
   * One formatter for the page, in UTC for the reason `Certificates` gives:
   * the dates are stored as a bare first-of-the-month, and read back in any
   * timezone behind UTC they would land in the month before.
   */
  const month = new Intl.DateTimeFormat(locale ?? defaultLocale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const period = (startedAt: Date, endedAt: Date | null) =>
    `${month.format(startedAt)} – ${endedAt ? month.format(endedAt) : dict.cv.present}`;

  // Grouped the way `Skills` groups them: a category surfaces where its first
  // skill sits in the admin's order.
  const byCategory = new Map<string, { label: string; names: string[] }>();

  for (const skill of skills) {
    const group = byCategory.get(skill.category) ?? { label: skill.category, names: [] };
    group.names.push(localized(locale, skill.name, skill.nameEn));
    group.label = localized(locale, group.label, skill.categoryEn);
    byCategory.set(skill.category, group);
  }

  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 pt-12 pb-28 sm:px-6 print:max-w-none print:gap-7 print:p-0">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl leading-tight sm:text-4xl">{dict.cv.name}</h1>
          <p className="text-lg">
            {dict.hero.role} · <span className="text-accent">{dict.hero.tagline}</span>
          </p>
          <p className="text-sm text-muted">
            {dict.location.city}, {dict.location.country}
          </p>

          {links.length > 0 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {links.map((link) => (
                <li key={link.id}>
                  {/* Still a link: a PDF keeps it clickable on screen. */}
                  <a
                    href={link.url}
                    className="underline-offset-4 hover:text-accent hover:underline"
                  >
                    {printable(link.url)}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </header>

        <CvSection title={dict.cv.profile}>
          <p className="leading-relaxed whitespace-pre-line">{about}</p>
        </CvSection>

        {/* Every section below renders nothing — heading included — until the
            admin has rows for it. */}
        {jobs.length > 0 && (
          <CvSection title={dict.cv.experience}>
            <ul className="flex flex-col gap-6 print:gap-4">
              {jobs.map((job) => (
                <li key={job.id} className="cv-entry flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="font-semibold">
                      {localized(locale, job.role, job.roleEn)} ·{" "}
                      {/*
                        Underlined like any link in running text, not in the
                        accent: on paper the colour may be gone, and the line
                        is what still says it leads somewhere in the PDF.
                      */}
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
                    </h3>
                    <p className="text-sm text-muted">{period(job.startedAt, job.endedAt)}</p>
                  </div>
                  {job.location && (
                    <p className="text-sm text-muted">
                      {localized(locale, job.location, job.locationEn)}
                    </p>
                  )}
                  <p className="leading-relaxed whitespace-pre-line">
                    {localized(locale, job.description, job.descriptionEn)}
                  </p>
                  {job.technologies.length > 0 && (
                    <p className="text-sm text-muted">{job.technologies.join(" · ")}</p>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>
        )}

        {studies.length > 0 && (
          <CvSection title={dict.cv.education}>
            <ul className="flex flex-col gap-4 print:gap-3">
              {studies.map((study) => (
                <li
                  key={study.id}
                  className="cv-entry flex flex-wrap items-baseline justify-between gap-x-4"
                >
                  <div>
                    <h3 className="font-semibold">
                      {localized(locale, study.degree, study.degreeEn)}
                    </h3>
                    <p className="text-sm">{study.institution}</p>
                  </div>
                  <p className="text-sm text-muted">{period(study.startedAt, study.endedAt)}</p>
                </li>
              ))}
            </ul>
          </CvSection>
        )}

        {byCategory.size > 0 && (
          <CvSection title={dict.skills.heading}>
            <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[max-content_1fr] print:grid-cols-[max-content_1fr]">
              {[...byCategory].map(([category, { label, names }]) => (
                <div key={category} className="contents">
                  <dt className="font-semibold">{label}</dt>
                  <dd>{names.join(", ")}</dd>
                </div>
              ))}
            </dl>
          </CvSection>
        )}

        {projects.length > 0 && (
          <CvSection title={dict.projects.heading}>
            <ul className="flex flex-col gap-5 print:gap-3">
              {/* No covers: they add nothing on paper and weigh down the PDF. */}
              {projects.map((project) => (
                <li key={project.id} className="cv-entry flex flex-col gap-1">
                  <h3 className="font-semibold">
                    {localized(locale, project.title, project.titleEn)}{" "}
                    <span className="font-normal text-muted">· {project.type}</span>
                  </h3>
                  <p className="leading-relaxed">
                    {localized(locale, project.description, project.descriptionEn)}
                  </p>
                  {project.technologies.length > 0 && (
                    <p className="text-sm text-muted">{project.technologies.join(" · ")}</p>
                  )}
                </li>
              ))}
            </ul>
          </CvSection>
        )}

        {certificates.length > 0 && (
          <CvSection title={dict.certificates.heading}>
            <ul className="flex flex-col gap-3 print:gap-2">
              {certificates.map((certificate) => (
                <li key={certificate.id} className="cv-entry">
                  <h3 className="font-semibold">
                    {localized(locale, certificate.title, certificate.titleEn)}
                  </h3>
                  <p className="text-sm text-muted">
                    {certificate.issuer}
                    {certificate.issuedAt && ` · ${month.format(certificate.issuedAt)}`}
                    {certificate.credentialId &&
                      ` · ${dict.certificates.credentialId}: ${certificate.credentialId}`}
                  </p>
                </li>
              ))}
            </ul>
          </CvSection>
        )}
      </main>

      <BottomBar label={dict.cv.bar}>
        {/*
          A plain anchor for the reason `CornerControls` gives: a full document
          load keeps the chosen theme. Icon-only below `sm`, where the bar has
          to share the bottom edge with the corner controls.
        */}
        <a href={`/${locale}`} className={BAR_ITEM} aria-label={dict.cv.back}>
          <ArrowLeftIcon size={18} />
          <span className="hidden sm:inline">{dict.cv.back}</span>
        </a>
        <CvPrintButton label={dict.cv.print} />
      </BottomBar>
    </>
  );
}
