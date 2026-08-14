"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

/** Ibarra, Imbabura. The city centre — deliberately not a street address. */
const IBARRA: [number, number] = [-78.1225, 0.3517];

/** Where the globe sits before the descent, half a planet away from Ecuador. */
const START: [number, number] = [20, 25];

/**
 * OpenFreeMap serves these tiles with no API key and no request limit, and its
 * TileJSON carries the credit it asks for in return, so the attribution control
 * picks it up on its own. Passing the same credit again as `customAttribution`
 * gets it printed twice: the wording matches but the markup does not, so the
 * control cannot tell the two apart.
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/**
 * maplibre-gl parses vector tiles in a worker, and it works out where that
 * worker lives by taking its own `import.meta.url` and swapping the filename.
 * Under a bundler that URL points at a build chunk, so the guess lands on a
 * file that was never emitted and the worker quietly fails: the raster relief
 * still draws, but no street ever loads. Serving the worker ourselves from
 * `public/maplibre` — see `scripts/copy-map-worker.mjs` — removes the guess.
 */
const WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";

type Props = {
  city: string;
  country: string;
  /** Describes the map for anyone who cannot see it. */
  description: string;
  unavailable: string;
};

export default function LocationMap({ city, country, description, unavailable }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const [arrived, setArrived] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;

    let map: MapLibreMap | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;

    /**
     * maplibre-gl reaches for `window` while it loads, so it can only be
     * imported once we are in the browser. Keeping it out of the module graph
     * also keeps its bulk out of the JavaScript the rest of the page needs.
     */
    import("maplibre-gl")
      .then(({ Map, Marker, setWorkerUrl }) => {
        if (cancelled) return;

        setWorkerUrl(WORKER_URL);

        map = new Map({
          container: element,
          style: STYLE_URL,
          center: START,
          // Far enough out that the planet reads as a ball with space around it.
          zoom: 0,
          /**
           * The map sits in the middle of the page, and swallowing wheel events
           * would trap anyone scrolling past it. Dragging and the buttons still
           * zoom.
           */
          scrollZoom: false,
        });

        let styleLoaded = false;

        map.on("error", () => {
          // Tile hiccups after the style is up are not worth a fallback; a
          // style that never arrives means there is no map to show at all.
          if (!styleLoaded) setFailed(true);
        });

        /**
         * `style.load` rather than `load`: `load` holds out until every source
         * has finished, which on a slow or flaky connection can be never, and
         * the flight would never start. The projection, the marker and the
         * camera only need the style.
         */
        map.once("style.load", () => {
          styleLoaded = true;
          if (!map) return;

          map.setProjection({ type: "globe" });

          // Long enough on the whole planet to register it before the descent.
          timer = setTimeout(() => {
            if (!map) return;

            map.once("moveend", () => {
              if (!map) return;

              /**
               * The pin waits for the landing. Added up front it hangs off the
               * rim of the globe, half-faded over the Atlantic, because Ibarra
               * starts out on the far side of the planet.
               */
              new Marker({ color: "#dc2626" }).setLngLat(IBARRA).addTo(map);
              setArrived(true);
            });

            /**
             * `flyTo` turns into an instant jump when the operating system asks
             * for reduced motion, which is why `essential` stays unset: nobody
             * needs to sit through a seven-second flight to find out where I am.
             */
            map.flyTo({
              center: IBARRA,
              /**
               * Close enough to place Ibarra in Imbabura, far enough that the
               * streets around it are nobody's business.
               */
              zoom: 10,
              duration: 7000,
              /**
               * Below the 1.42 default. `flyTo` front-loads the zoom as the
               * curve rises, and at 1.5 the camera was already on top of Ibarra
               * less than halfway through, leaving most of the flight as a slow
               * crawl. A flatter curve spreads the descent across the whole run.
               */
              curve: 1,
            });
          }, 2000);
        });
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      map?.remove();
    };
  }, []);

  if (failed) {
    return (
      <p className="text-gray-500">
        {unavailable} {city}, {country}.
      </p>
    );
  }

  return (
    <div className="relative h-80 w-full overflow-hidden rounded-lg sm:h-[28rem]">
      <div
        ref={container}
        role="img"
        aria-label={description}
        className="h-full w-full bg-gray-200"
      />

      {/* Held back until the flight lands, so it reads as the destination. */}
      {arrived && (
        <p className="pointer-events-none absolute top-4 left-4 rounded bg-white/90 px-3 py-2 font-semibold shadow">
          {city} — {country}
        </p>
      )}
    </div>
  );
}
