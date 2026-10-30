"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import SkillChip from "./SkillChip";

type Group = {
  key: string;
  label: string;
  skills: { id: string; name: string; icon: string | null }[];
};

/**
 * How fast the chips travel, in pixels a second: slow enough to read every
 * name as it goes by. The first version ran at about 46 and was too quick.
 */
const SPEED = 34;

/**
 * Enough chips in each half of the loop to outrun the widest column, so a
 * short list still fills the lane with no gap.
 */
const MIN_PER_HALF = 8;

/**
 * One lane, every category in it, one after another with no gap: CMS, then the
 * languages straight behind, then the databases, and round again — moving left
 * to right. The name above is the category whose chips are crossing the middle
 * of the lane, so it changes the moment the next category arrives there; three
 * dots say which one it is.
 *
 * The loop is the sequence twice over, slid by exactly half its width, so the
 * second copy lands where the first began and the seam never shows. Its
 * duration is measured from that half's width, so the speed is the same
 * whatever is in it. Being a CSS animation, it pauses under the pointer and
 * with the section's pause button straight from `app/globals.css`.
 *
 * Which category is in the middle is found by an IntersectionObserver whose
 * root is the lane, shrunk to a thin band down its centre: no polling, and it
 * follows the chips as they move.
 *
 * Decoration for sighted visitors only: the lane is `aria-hidden`, and the
 * same content is in the list above it, which is what a screen reader reads
 * and what shows under reduced motion.
 */
export default function SkillLane({ groups }: { groups: Group[] }) {
  const [current, setCurrent] = useState(0);
  const [timing, setTiming] = useState<{ duration: number; delay: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const loop = useRef<HTMLDivElement>(null);

  const chips = groups.reduce((total, group) => total + group.skills.length, 0);
  const times = Math.max(1, Math.ceil(MIN_PER_HALF / chips));
  /**
   * Laid out backwards. The lane moves to the right, so what reaches the middle
   * next is whatever sits to the left of what is there now: written in order,
   * CMS would be followed by the databases. Reversed — the categories, and the
   * skills inside each — they arrive in the order the admin gave them.
   */
  const sequence = Array.from({ length: times }, () => groups.map((_, index) => index))
    .flat()
    .reverse();

  /**
   * The half's width only the browser knows; measured before the first paint
   * and again whenever the window changes it.
   *
   * The loop is also started part-way through, by a negative delay, so the
   * first category's first skill is the one in the middle of the lane at load:
   * the run opens on CMS rather than wherever the seam happens to fall.
   */
  useLayoutEffect(() => {
    const measure = () => {
      if (!loop.current || !stage.current) return;

      const half = loop.current.scrollWidth / 2;
      const duration = half / SPEED;
      const middle = stage.current.offsetWidth / 2;

      // Where the loop has to sit for the first group's leading edge — its
      // right edge, since chips travel rightwards — to be at the middle. Any
      // copy will do, as long as the position is inside the loop's travel,
      // from minus a half to nothing.
      const offsets = [...loop.current.querySelectorAll<HTMLElement>('[data-group="0"]')].map(
        (group) => middle - (group.offsetLeft + group.offsetWidth) + 1,
      );
      const start = offsets.find((offset) => offset >= -half && offset <= 0) ?? -half;

      setTiming({ duration, delay: -((start + half) / half) * duration });
    };

    measure();
    window.addEventListener("resize", measure);

    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!stage.current || !loop.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setCurrent(Number((entry.target as HTMLElement).dataset.group));
          }
        }
      },
      // A band 2% wide down the middle of the lane.
      { root: stage.current, rootMargin: "0px -49% 0px -49%" },
    );

    loop.current.querySelectorAll("[data-group]").forEach((group) => observer.observe(group));

    return () => observer.disconnect();
  }, []);

  return (
    <div aria-hidden="true" className="skill-lane flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {/* Keyed, so each new name fades in rather than just swapping. */}
        <p
          key={current}
          className="skill-lane-label font-sans text-xs font-semibold tracking-[0.08em] text-muted uppercase"
        >
          {groups[current].label}
        </p>

        {groups.length > 1 && (
          <span className="flex gap-1.5">
            {groups.map((group, index) => (
              <span
                key={group.key}
                className={`size-1.5 rounded-full transition-colors duration-300 ${index === current ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </span>
        )}
      </div>

      <div ref={stage} className="skill-lane-stage">
        <div
          ref={loop}
          className="skill-lane-loop"
          style={
            timing
              ? {
                  animationDuration: `${timing.duration.toFixed(2)}s`,
                  animationDelay: `${timing.delay.toFixed(2)}s`,
                }
              : undefined
          }
          data-running={timing ? "" : undefined}
        >
          {[0, 1].map((half) => (
            <div key={half} className="skill-lane-run">
              {sequence.map((index, position) => (
                // A dot between categories, so the hand-over is seen as well
                // as named.
                <div key={position} className="flex items-center gap-2">
                  <ul data-group={index} className="flex gap-2">
                    {groups[index].skills.toReversed().map((skill) => (
                      <li key={skill.id}>
                        <SkillChip name={skill.name} icon={skill.icon} />
                      </li>
                    ))}
                  </ul>
                  <span className="mx-2 size-1.5 shrink-0 rounded-full bg-border" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
