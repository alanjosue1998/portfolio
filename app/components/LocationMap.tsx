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
const STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;

/**
 * maplibre-gl parses vector tiles in a worker, and it works out where that
 * worker lives by taking its own `import.meta.url` and swapping the filename.
 * Under a bundler that URL points at a build chunk, so the guess lands on a
 * file that was never emitted and the worker quietly fails: the raster relief
 * still draws, but no street ever loads. Serving the worker ourselves from
 * `public/maplibre` — see `scripts/copy-map-worker.mjs` — removes the guess.
 */
const WORKER_URL = "/maplibre/maplibre-gl-worker.mjs";

type Scheme = keyof typeof STYLES;

/** The same three-state rule the colours follow — see `app/globals.css`. */
function currentScheme(): Scheme {
  const chosen = document.documentElement.dataset.theme;

  if (chosen === "light" || chosen === "dark") return chosen;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

type Props = {
  city: string;
  country: string;
  /** Describes the map for anyone who cannot see it. */
  description: string;
  unavailable: string;
  /** Laid over the bottom of the map: the greeting and the portrait. */
  children: React.ReactNode;
};

export default function LocationMap({ city, country, description, unavailable, children }: Props) {
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
    const started = import("maplibre-gl")
      .then(({ AttributionControl, Map, Marker, setWorkerUrl }) => {
        if (cancelled) return;

        setWorkerUrl(WORKER_URL);

        let scheme = currentScheme();

        map = new Map({
          container: element,
          style: STYLES[scheme],
          center: START,
          /**
           * Close enough that the planet fills the frame rather than sitting
           * in the middle of it, while still curving away at the edges — past
           * roughly 4 the globe stops reading as one. At 2.2 it opened as a
           * marble with page on every side of it.
           */
          zoom: 3,
          /**
           * The map sits in the middle of the page, and swallowing wheel events
           * would trap anyone scrolling past it. Dragging and the buttons still
           * zoom.
           */
          scrollZoom: false,
          /**
           * The credit OpenFreeMap asks for cannot stay in its usual corner:
           * the portrait sits there, and the gradient behind the greeting would
           * paint straight over it. Moved rather than hidden — it is the
           * condition the tiles come with.
           */
          attributionControl: false,
        });

        map.addControl(new AttributionControl({ compact: true }), "top-right");

        /**
         * Folds the credit into its ⓘ. `compact` alone only picks the
         * collapsible shape — maplibre-gl still renders it open, and folds it
         * away only once the map is dragged. Spelled out it is a paragraph
         * lying across the top of a map barely 300px tall.
         *
         * Called at the end of the flight rather than at startup, because
         * maplibre-gl rebuilds this control every time attribution data
         * arrives and would undo an earlier fold. It also means the credit is
         * spelled out for the whole of the descent, and only tidies itself
         * away once the greeting appears.
         */
        function foldCredit(instance: MapLibreMap) {
          const credit = instance.getContainer().querySelector(".maplibregl-ctrl-attrib");

          credit?.classList.remove("maplibregl-compact-show");
          credit?.removeAttribute("open");
        }

        let styleLoaded = false;
        let flown = false;

        map.on("error", () => {
          // Tile hiccups after the style is up are not worth a fallback; a
          // style that never arrives means there is no map to show at all.
          if (!styleLoaded) setFailed(true);
        });

        /**
         * `on` rather than `once`: swapping the light and dark styles loads a
         * whole new stylesheet, and the globe projection has to be set again
         * each time or the map drops back to a flat mercator.
         *
         * `style.load` rather than `load`, too. `load` holds out until every
         * source has finished, which on a slow or flaky connection can be
         * never, and the flight would never start.
         */
        map.on("style.load", () => {
          styleLoaded = true;
          if (!map) return;

          map.setProjection({ type: "globe" });

          if (flown) return;
          flown = true;

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
              foldCredit(map);
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

        /**
         * A bright street map under a dark page reads as a hole in it, so the
         * map follows the theme. Both routes into a change are watched: the
         * attribute the menu writes, and the system setting behind "Auto".
         */
        function follow() {
          const next = currentScheme();
          if (!map || next === scheme) return;

          scheme = next;
          map.setStyle(STYLES[next]);
        }

        const themeAttribute = new MutationObserver(follow);
        themeAttribute.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ["data-theme"],
        });

        const systemSetting = window.matchMedia("(prefers-color-scheme: dark)");
        systemSetting.addEventListener("change", follow);

        return () => {
          themeAttribute.disconnect();
          systemSetting.removeEventListener("change", follow);
        };
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      clearTimeout(timer);
      // Stops watching the theme, whether or not the map ever got built.
      started.then((stopWatching) => stopWatching?.());
      map?.remove();
    };
  }, []);

  if (failed) {
    return (
      <p className="text-muted">
        {unavailable} {city}, {country}.
      </p>
    );
  }

  /**
   * Square corners: with the bottom already dissolving into the page, rounded
   * ones only softened the two edges that are still meant to be edges.
   * `overflow-hidden` stays — it is what keeps the canvas inside the frame.
   */
  return (
    <div className="relative h-72 w-full overflow-hidden sm:h-[22rem]">
      <div
        ref={container}
        role="img"
        aria-label={description}
        className="h-full w-full bg-border"
      />

      {/*
        Dissolves the bottom of the map into the page — there is no border now,
        so this is what ends it — and gives the greeting a ground light or dark
        enough to be read against whatever terrain happens to be underneath.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/85 to-transparent" />

      {/*
        Everything that sits on the map is grouped down here. The city label
        used to live in the top-left corner, where on a narrow screen it ran
        straight into the attribution across from it.
      */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-3 p-5 sm:p-6">
        {/* Held back until the flight lands, so it reads as the destination. */}
        {arrived && (
          <p className="self-start rounded bg-surface/90 px-3 py-1.5 text-sm font-semibold text-foreground shadow">
            {city} — {country}
          </p>
        )}

        <div className="flex items-end justify-between gap-4">{children}</div>
      </div>
    </div>
  );
}
