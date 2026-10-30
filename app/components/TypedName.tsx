"use client";

import { useEffect, useState } from "react";

type Props = {
  /** The whole sentence, as a screen reader and a crawler should get it. */
  full: string;
  /** What stays put while the rest is typed: "Soy", "I'm". */
  prefix: string;
  /** Typed one after another in a loop. The first is the name. */
  phrases: string[];
};

/** Milliseconds per letter typed, per letter deleted, and the pauses between. */
const TYPE = 85;
const DELETE = 40;
const HOLD = 2600;
const GAP = 350;

/**
 * The page's `<h1>`: "Soy" and then, typed and deleted in turn, the name and
 * the roles — "Alan Guamán", "ingeniero de sistemas"…
 *
 * Only the eye gets the animation. The heading's text for everyone else is the
 * whole sentence, steady, in an `sr-only` span; the moving letters are
 * `aria-hidden`, so a screen reader never hears half a word.
 *
 * The server renders the first phrase complete, so the name is in the HTML and
 * on screen from the first paint, and the loop only starts after a hold. Under
 * reduced motion it never starts: the name just stays.
 *
 * Every phrase is also laid out, invisible, in the same grid cell, so the
 * heading is always as wide and as tall as its longest phrase. Without that it
 * would grow and shrink with every letter, nudging the greeting up and down
 * the map as lines wrapped and unwrapped.
 */
export default function TypedName({ full, prefix, phrases }: Props) {
  const [text, setText] = useState(phrases[0]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer: ReturnType<typeof setTimeout>;
    let phrase = 0;
    let length = phrases[0].length;
    let deleting = true;

    function step() {
      const current = phrases[phrase];

      if (deleting) {
        length -= 1;
        setText(current.slice(0, length));

        if (length > 0) {
          timer = setTimeout(step, DELETE);
          return;
        }

        deleting = false;
        phrase = (phrase + 1) % phrases.length;
        timer = setTimeout(step, GAP);
        return;
      }

      const next = phrases[phrase];
      length += 1;
      setText(next.slice(0, length));

      if (length < next.length) {
        timer = setTimeout(step, TYPE);
        return;
      }

      deleting = true;
      timer = setTimeout(step, HOLD);
    }

    timer = setTimeout(step, HOLD);

    return () => clearTimeout(timer);
  }, [phrases]);

  return (
    <h1 className="text-3xl leading-tight tracking-tight sm:text-4xl">
      <span className="sr-only">{full}</span>
      <span aria-hidden="true" className="grid">
        {phrases.map((phrase) => (
          <span key={phrase} className="invisible col-start-1 row-start-1">
            {prefix} {phrase}
          </span>
        ))}
        <span className="col-start-1 row-start-1">
          {prefix} {text}
          <span className="typed-caret" />
        </span>
      </span>
    </h1>
  );
}
