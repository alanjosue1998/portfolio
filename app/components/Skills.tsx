import { lang } from "next/root-params";

import { getDictionary } from "@/lib/dictionaries";
import { localized } from "@/lib/i18n";
import prisma from "@/lib/prisma";
import { skillIcon } from "@/lib/skill-icons";

import MarqueeToggle from "./MarqueeToggle";
import SectionHeading from "./SectionHeading";
import SkillChip from "./SkillChip";
import SkillLane from "./SkillLane";

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

  // Names and logos settled here, on the server, so only the paths in use
  // travel to the browser for the moving lane.
  const groups = [...byCategory].map(([category, group]) => ({
    key: category,
    label: group.label,
    skills: group.skills.map((skill) => {
      const name = localized(locale, skill.name, skill.nameEn);
      return { id: skill.id, name, icon: skillIcon(name) };
    }),
  }));

  return (
    <section id="skills" className="flex scroll-mt-8 flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <SectionHeading>{dict.skills.heading}</SectionHeading>
        </div>
        <MarqueeToggle labels={{ pause: dict.skills.pause, play: dict.skills.play }} />
      </div>

      {/*
        Every category with its skills, as a plain list: what a screen reader
        reads, and what is on screen when the visitor asked for less motion —
        `app/globals.css` keeps it out of sight otherwise, while the lane below
        plays the same content one category at a time.
      */}
      <div className="skill-list flex flex-col gap-5">
        {groups.map((group) => (
          <div key={group.key} className="flex flex-col gap-3">
            {/*
              A heading rather than a styled paragraph: this is a real level in
              the outline, and a screen reader listing headings should find the
              categories under Skills.
            */}
            <h3 className="font-sans text-xs font-semibold tracking-[0.08em] text-muted uppercase">
              {group.label}
            </h3>
            <ul className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li key={skill.id}>
                  <SkillChip name={skill.name} icon={skill.icon} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <SkillLane groups={groups} />
    </section>
  );
}
