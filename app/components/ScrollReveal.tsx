"use client";

import { useEffect } from "react";

/**
 * Lets each section of the home page rise into place the first time it
 * scrolls into view. The look is in `app/globals.css`; this only decides when.
 *
 * It replaced a pure-CSS version (`animation-timeline: view()`), which Firefox
 * does not run at all and which, at 12px, was too slight to notice where it
 * did. An IntersectionObserver works in every browser.
 *
 * Only sections still below the fold are hidden, and only once this has run, so
 * nothing on screen at load ever blinks out, and without JavaScript nothing is
 * hidden at all. Each section is revealed once and then left alone: scrolling
 * back up does not replay it.
 */
export default function ScrollReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const sections = [...document.querySelectorAll<HTMLElement>(".reveal-sections > section")];

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          (entry.target as HTMLElement).dataset.reveal = "in";
          observer.unobserve(entry.target);
        }
      },
      // Revealed once a sliver of it is a little way into the window, so the
      // rise is seen rather than happening just under the bottom edge.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    for (const section of sections) {
      if (section.getBoundingClientRect().top < window.innerHeight) continue;

      section.dataset.reveal = "out";
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, []);

  return null;
}
