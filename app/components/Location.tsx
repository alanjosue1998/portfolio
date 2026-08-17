import Image from "next/image";

import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

import LocationMap from "./LocationMap";

/**
 * Reads the translations on the server and hands them to the map, which has to
 * be a Client Component and so cannot call `getDictionary` itself. The greeting
 * travels in as children and is laid over the map, rather than being passed as
 * a pile of string props.
 */
export default async function Location() {
  const [dict, profile] = await Promise.all([
    getDictionary(),
    prisma.profile.findUnique({ where: { id: "main" } }),
  ]);

  return (
    <LocationMap
      city={dict.location.city}
      country={dict.location.country}
      description={dict.location.description}
      unavailable={dict.location.unavailable}
    >
      <div>
        <p className="text-sm text-muted sm:text-base">{dict.hero.greeting}</p>
        <h1 className="text-2xl sm:text-3xl">{dict.hero.name}</h1>
      </div>

      {/*
        The portrait is uploaded from `/admin`; the dashed circle below holds
        the space until one is. It stays hidden from screen readers because an
        empty frame has nothing to announce.

        `96` is the rendered width at `sm:size-24`, doubled by the optimiser for
        retina. `preload` — `priority` is deprecated as of Next 16 — because
        this sits in the opening panel and would otherwise load late.
      */}
      {profile?.imageUrl ? (
        <Image
          src={profile.imageUrl}
          alt={dict.hero.name}
          width={96}
          height={96}
          preload
          className="size-20 shrink-0 rounded-full border-2 border-surface object-cover shadow sm:size-24"
        />
      ) : (
        <div
          aria-hidden="true"
          className="flex size-20 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted bg-surface/70 text-muted sm:size-24"
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <circle cx="12" cy="8.5" r="3.5" />
            <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
          </svg>
        </div>
      )}
    </LocationMap>
  );
}
