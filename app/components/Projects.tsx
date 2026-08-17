import Image from "next/image";

import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

export default async function Projects() {
  const [dict, projects] = await Promise.all([
    getDictionary(),
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  // A heading over an empty grid says less than nothing.
  if (projects.length === 0) return null;

  return (
    <section className="flex flex-col gap-6">
      <h2>{dict.projects.heading}</h2>

      {/* One column on a phone, two from `sm` up. */}
      <ul className="grid gap-6 sm:grid-cols-2">
        {projects.map((project) => (
          <li
            key={project.id}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface"
          >
            {/*
              The cover is optional, and a card without one has to hold its own
              rather than leave a gap. `aspect-video` fixes the frame so a mix
              of portrait and landscape uploads still lines up across the grid,
              and `object-cover` crops rather than squashing them to fit.

              The alt is empty on purpose: the title sits directly below, and a
              screen reader announcing the project name twice is noise. `sizes`
              tells the optimiser a card is half the 1280px column on desktop
              and the full width of a phone, so it stops sending the largest
              file to the smallest screen.
            */}
            {project.imageUrl && (
              <Image
                src={project.imageUrl}
                alt=""
                width={640}
                height={360}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="aspect-video w-full object-cover"
              />
            )}

            <div className="flex flex-col gap-2 p-5">
              <p className="text-sm text-muted">
                {dict.projects.typeLabel}: {project.type}
              </p>
              <h3 className="text-lg">{project.title}</h3>
              <p>{project.description}</p>

              {project.technologies.length > 0 && (
                <ul className="mt-2 flex flex-wrap gap-2 border-t border-border pt-3">
                  {project.technologies.map((technology) => (
                    <li key={technology} className="rounded bg-background px-2 py-1 text-xs">
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
