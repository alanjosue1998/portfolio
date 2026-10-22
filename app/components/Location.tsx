import Image from "next/image";

import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

import { ArrowDownIcon, UserIcon } from "./icons";
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
        <h1 className="text-3xl leading-tight tracking-tight sm:text-4xl">{dict.hero.name}</h1>
      </div>

      {/*
        The portrait is uploaded from `/admin`; the dashed square below holds
        the space until one is. It stays hidden from screen readers because an
        empty frame has nothing to announce.

        `144` is the rendered width at `sm:size-36`, doubled by the optimiser
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

        Hovering used to zoom the picture, which looked like something but said
        nothing. A caption slides up instead, because the one thing this element
        needs to say is that it goes somewhere: it is a link to the About
        section and, until now, only a screen reader was told so.
      */}
      {profile?.imageUrl ? (
        <a
          href="#about"
          aria-label={dict.about.heading}
          className="group pointer-events-auto relative mr-4 block shrink-0 overflow-hidden rounded-2xl border-[3px] border-surface shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:-translate-y-0.5 sm:mr-8"
        >
          <Image
            src={profile.imageUrl}
            alt={dict.hero.name}
            width={144}
            height={144}
            preload
            className="size-28 object-cover sm:size-36"
          />

          {/*
            Parked just below the frame and slid up into it, so the picture is
            never covered until someone asks. `group-focus-visible` matters as
            much as the hover: a caption only a mouse can reach is a caption
            half the people who need it never see.

            The transition is the only part held back for reduced motion — the
            caption still arrives, it just arrives at once.

            Hidden from assistive tech because the anchor's `aria-label` already
            says this, and saying it twice is worse than saying it once.
          */}
          <span
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-center gap-1 bg-surface/95 py-1.5 text-xs font-medium text-foreground group-hover:translate-y-0 group-focus-visible:translate-y-0 motion-safe:transition-transform motion-safe:duration-300"
          >
            {dict.about.heading}
            <ArrowDownIcon size={12} />
          </span>
        </a>
      ) : (
        <div
          aria-hidden="true"
          className="mr-4 flex size-28 shrink-0 items-center justify-center rounded-2xl border-[3px] border-surface bg-accent-soft text-accent-strong shadow-[0_10px_30px_-12px_rgb(0_0_0/0.35)] sm:mr-8 sm:size-36"
        >
          <UserIcon size={36} />
        </div>
      )}
    </LocationMap>
  );
}
