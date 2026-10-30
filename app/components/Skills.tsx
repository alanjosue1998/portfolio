import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { localized } from "@/lib/i18n";
import prisma from "@/lib/prisma";
import { skillIcon } from "@/lib/skill-icons";

import MarqueeToggle from "./MarqueeToggle";
import SectionHeading from "./SectionHeading";

export default async function Skills() {
  const [dict, locale, skills] = await Promise.all([
    getDictionary(),
    lang(),
    /**
     * `position` orders the whole list, not just within a group. Because the
     * grouping below keeps the order the rows arrive in, a category surfaces
     * wherever its first skill sits — so one number in the admin controls both
     * which category comes first and the order inside it.
     */
    prisma.skill.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
  ]);

  // A heading over an empty list says less than nothing.
  if (skills.length === 0) return null;

  /**
   * Grouped by the Spanish category, which is the one every skill has, and
   * headed by its English name on `/en` — taken from whichever skill in the
   * group has one, since it only needs typing once per category.
   */
  const byCategory = new Map<string, { label: string; skills: typeof skills }>();

  for (const skill of skills) {
    const group = byCategory.get(skill.category) ?? { label: skill.category, skills: [] };
    group.skills.push(skill);
    group.label = localized(locale, group.label, skill.categoryEn);
    byCategory.set(skill.category, group);
  }

  return (
    <section id="skills" className="flex scroll-mt-8 flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SectionHeading>{dict.skills.heading}</SectionHeading>
        </div>
        <MarqueeToggle labels={{ pause: dict.skills.pause, play: dict.skills.play }} />
      </div>

      {/*
        A row per category: its name, and its skills running past underneath,
        left to right, in a loop. No cards — the rows are the structure, and a
        box around a strip that moves only fenced it in. Each row runs at its
        own pace so they never move in step.
      */}
      <div className="flex flex-col gap-6">
        {[...byCategory].map(([category, group], row) => (
          <div key={category} className="flex flex-col gap-3">
            {/*
              A heading rather than a styled paragraph: this is a real level in
              the outline, and a screen reader listing headings should find the
              categories under Skills.
            */}
            <h3 className="font-sans text-xs font-semibold tracking-[0.08em] text-muted uppercase">
              {group.label}
            </h3>

            <Marquee
              names={group.skills.map((skill) => localized(locale, skill.name, skill.nameEn))}
              pace={1 + row * 0.15}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Enough chips in each half of the strip to outrun the widest column, so the
 * loop never shows a gap — a category with one skill still fills its row.
 */
const MIN_PER_HALF = 8;

/** Seconds a chip takes to travel its own width and gap, near enough. */
const SECONDS_PER_CHIP = 2.6;

/**
 * One category's skills on a loop. The strip holds the same run twice, and
 * `app/globals.css` slides it by exactly half its width, so the second run
 * lands where the first began and the seam never shows.
 *
 * Only the first run of names is read out — every repeat is `aria-hidden`.
 * Under reduced motion the repeats are not drawn and the first run simply
 * wraps, as the chips did before.
 */
function Marquee({ names, pace }: { names: string[]; pace: number }) {
  const times = Math.ceil(MIN_PER_HALF / names.length);
  const run = Array.from({ length: times }, () => names).flat();

  return (
    <div className="marquee">
      <div
        className="marquee-track"
        style={
          {
            "--marquee-duration": `${(run.length * SECONDS_PER_CHIP * pace).toFixed(1)}s`,
          } as React.CSSProperties
        }
      >
        {[0, 1].map((half) => (
          <ul key={half} aria-hidden={half === 1 || undefined} className="marquee-run">
            {run.map((name, index) => (
              <li key={index} aria-hidden={(half === 0 && index >= names.length) || undefined}>
                <SkillChip name={name} />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}

/**
 * A skill and its logo, drawn in the chip's own colour so every brand sits in
 * the theme rather than in its own palette. A skill Simple Icons does not know
 * gets its initial in a disc of the same size, so no chip is missing a mark.
 */
function SkillChip({ name }: { name: string }) {
  const path = skillIcon(name);

  return (
    <span className="flex items-center gap-2 rounded-full bg-accent-soft py-2 pr-4 pl-3 text-sm font-medium whitespace-nowrap text-accent-strong">
      {path ? (
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="currentColor"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d={path} />
        </svg>
      ) : (
        <span
          aria-hidden="true"
          className="grid size-[18px] shrink-0 place-items-center rounded-full bg-accent-strong text-[10px] font-bold text-accent-soft"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      {name}
    </span>
  );
}
