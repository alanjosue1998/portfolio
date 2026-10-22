import Image from "next/image";

import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { localized } from "@/lib/i18n";
import prisma from "@/lib/prisma";

import SectionHeading from "./SectionHeading";

export default async function Projects() {
  const [dict, locale, projects] = await Promise.all([
    getDictionary(),
    lang(),
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // A heading over an empty grid says less than nothing.
  if (projects.length === 0) return null;

  return (
    <section className="flex flex-col gap-5">
      <SectionHeading>{dict.projects.heading}</SectionHeading>

      {/* One column on a phone, two from `sm` up. */}
      <ul className="grid gap-5 sm:grid-cols-2">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface transition-[border-color,box-shadow,translate] duration-200 hover:border-accent hover:shadow-[0_8px_24px_-12px_rgb(28_25_23/0.25)] motion-safe:hover:-translate-y-0.5"
          >
            {/*
              The cover is optional, and a card without one has to hold its own
              rather than leave a gap. `aspect-video` fixes the frame so a mix
              of portrait and landscape uploads still lines up across the grid,
              and `object-cover` crops rather than squashing them to fit.

              The alt is empty on purpose: the title sits directly below, and a
              screen reader announcing the project name twice is noise.

              `sizes` is measured off the column rather than off the viewport
              once the column stops growing. `max-w-3xl` counts its padding inside the
              768, so from a 768px viewport up a card is a flat 348px and
              declaring `50vw` there asks for a file twice the frame it lands in.
              Below that the column is the viewport and `50vw` is honest again.
            */}
            {project.imageUrl && (
              <Image
                src={project.imageUrl}
                alt=""
                width={640}
                height={360}
                sizes="(min-width: 768px) 348px, (min-width: 640px) 50vw, 100vw"
                className="aspect-video w-full object-cover"
              />
            )}

            <div className="flex flex-1 flex-col gap-2.5 px-6 pt-5 pb-6">
              {/* A badge says "type" by being a badge; the word stays for
                  screen readers, which get no badge. */}
              <p className="self-start rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-strong">
                <span className="sr-only">{dict.projects.typeLabel}: </span>
                {project.type}
              </p>
              <h3 className="text-xl leading-snug">
                {localized(locale, project.title, project.titleEn)}
              </h3>
              <p className="text-[15px] text-muted">
                {localized(locale, project.description, project.descriptionEn)}
              </p>

              {project.technologies.length > 0 && (
                <ul className="mt-auto flex flex-wrap gap-1.5 pt-2">
                  {project.technologies.map((technology) => (
                    <li
                      key={technology}
                      className="rounded-md border border-border bg-background px-2 py-0.5 font-mono text-xs"
                    >
                      {technology}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
