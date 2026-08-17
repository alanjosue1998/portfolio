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
        The portrait is uploaded from `/admin`; the dashed square below holds
        the space until one is. It stays hidden from screen readers because an
        empty frame has nothing to announce.

        `176` is the rendered width at `sm:size-44`, doubled by the optimiser
        for retina. `preload` — `priority` is deprecated as of Next 16 —
        because this sits in the opening panel and would otherwise load late.

        The right margin pulls it in off the edge; the greeting opposite is
        anchored by the wrapper's `justify-between`, so nudging this one is
        what moves it without disturbing the other.

        The link is a plain anchor rather than a click handler: it scrolls
        without JavaScript, takes keyboard focus on its own, and offers the
        usual right-click menu. `pointer-events-auto` is not optional — the
        overlay wrapper in `LocationMap` switches pointer events off so the map
        underneath stays draggable, and without this the link would be dead.

        The zoom lives on the image while the anchor clips it, so the picture
        grows inside a frame that stays put instead of the whole thing swelling
        and shoving the greeting sideways.
      */}
      {profile?.imageUrl ? (
        <a
          href="#about"
          aria-label={dict.about.heading}
          className="group pointer-events-auto mr-4 block shrink-0 overflow-hidden rounded-2xl border-2 border-surface shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:mr-8"
        >
          <Image
            src={profile.imageUrl}
            alt={dict.hero.name}
            width={176}
            height={176}
            preload
            className="size-32 object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-110 sm:size-44"
          />
        </a>
      ) : (
        <div
          aria-hidden="true"
          className="mr-4 flex size-32 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-muted bg-surface/70 text-muted sm:mr-8 sm:size-44"
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
