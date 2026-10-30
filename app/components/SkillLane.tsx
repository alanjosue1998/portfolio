"use client";

import { useLayoutEffect, useRef, useState } from "react";

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
 * One lane, one category at a time: its name above, and its skills entering
 * from the left, crossing, and leaving on the right. When the last chip is
 * gone the name changes and the next category comes in, in the same place —
 * CMS, then languages, then databases, and round again.
 *
 * Each pass is a CSS animation from just out of sight on the left to just out
 * of sight on the right, so it pauses with the rest of the section's motion —
 * under the pointer, or with the section's pause button — straight from
 * `app/globals.css`. Its length depends on how wide that category's chips are,
 * which only the browser knows: it is measured before the pass starts, and set
 * so every category moves at the same speed.
 *
 * Decoration for sighted visitors only: the whole lane is `aria-hidden`, and
 * the same content is in the list above it, which is what a screen reader
 * reads and what shows under reduced motion.
 */
export default function SkillLane({ groups }: { groups: Group[] }) {
  // Passes counted rather than the category's index, so a single category
  // still starts a fresh pass each time round.
  const [pass, setPass] = useState(0);
  const [duration, setDuration] = useState<number | null>(null);
  const lane = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  const index = pass % groups.length;
  const group = groups[index];

  // Measured before paint, so a pass never starts at the wrong length.
  useLayoutEffect(() => {
    if (!lane.current || !track.current) return;

    const distance = lane.current.offsetWidth + track.current.offsetWidth;
    setDuration(distance / SPEED);
  }, [pass]);

  return (
    <div aria-hidden="true" className="skill-lane flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        {/* Keyed, so each new name fades in rather than just swapping. */}
        <p
          key={pass}
          className="skill-lane-label font-sans text-xs font-semibold tracking-[0.08em] text-muted uppercase"
        >
          {group.label}
        </p>

        {groups.length > 1 && (
          <span className="flex gap-1.5">
            {groups.map((other, position) => (
              <span
                key={other.key}
                className={`size-1.5 rounded-full transition-colors duration-300 ${position === index ? "bg-accent" : "bg-border"}`}
              />
            ))}
          </span>
        )}
      </div>

      <div ref={lane} className="skill-lane-stage">
        <ul
          // A new key per pass restarts the animation from the left edge.
          key={pass}
          ref={track}
          className="skill-lane-track"
          style={duration ? { animationDuration: `${duration.toFixed(2)}s` } : undefined}
          data-running={duration ? "" : undefined}
          onAnimationEnd={() => {
            setDuration(null);
            setPass((current) => current + 1);
          }}
        >
          {group.skills.map((skill) => (
            <li key={skill.id}>
              <SkillChip name={skill.name} icon={skill.icon} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
