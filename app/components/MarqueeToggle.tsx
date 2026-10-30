"use client";

import { useState } from "react";

import { PauseIcon, PlayIcon } from "./icons";

/**
 * Stops and restarts the moving rows of a section. Anything that moves on its
 * own for more than five seconds needs a way to stop it (WCAG 2.2.2), and the
 * pause on hover only helps a mouse: this is the one a finger or a keyboard
 * can reach.
 *
 * It sets `data-paused` on the section it sits in, and `app/globals.css` does
 * the rest, so the rows themselves stay Server Components. Hidden when the
 * visitor asked for less motion, since then nothing moves to begin with.
 */
export default function MarqueeToggle({ labels }: { labels: { pause: string; play: string } }) {
  const [paused, setPaused] = useState(false);

  return (
    <button
      type="button"
      onClick={(event) => {
        const next = !paused;
        event.currentTarget.closest("section")?.toggleAttribute("data-paused", next);
        setPaused(next);
      }}
      // The label says what a press does, and changes with it. `aria-pressed`
      // on top would announce the state twice.
      className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-semibold text-muted transition-colors hover:border-accent hover:text-accent motion-reduce:hidden"
    >
      {paused ? <PlayIcon size={14} /> : <PauseIcon size={14} />}
      {paused ? labels.play : labels.pause}
    </button>
  );
}
