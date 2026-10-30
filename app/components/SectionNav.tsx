"use client";

import { useEffect, useState } from "react";

import { BriefcaseIcon, CodeIcon, FileIcon, GridIcon, TextIcon, UserIcon } from "./icons";

/** The sections the bar can point at, by the `id` each one carries. */
export type SectionId = "about" | "experience" | "skills" | "projects";

const ICONS = {
  about: TextIcon,
  experience: BriefcaseIcon,
  skills: CodeIcon,
  projects: GridIcon,
};

type Props = {
  /** Only the sections that rendered: one with no rows has no heading to go to. */
  sections: { id: SectionId; label: string }[];
  top: string;
  cv: { href: string; label: string };
};

/**
 * Every item shares the bar's shape. Icon-only and 40px below `lg`, where the
 * bar has to fit six of them beside the corner controls on a 360px phone. From
 * `lg` the sections spell out their names: at `md` they did fit, in Spanish,
 * with 6px to spare before the corner controls — one more section and the two
 * would overlap.
 */
const ITEM =
  "inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors duration-200 lg:h-11 lg:px-4";

const IDLE = "text-foreground hover:text-accent";

/** The section on screen: the accent's soft fill, the way a skill chip wears it. */
const ACTIVE = "bg-accent-soft text-accent-strong";

/**
 * Which item matches what is on screen: the last section whose top has passed
 * a line 30% down the window. The gap after a section still counts as that
 * section, so the highlight never blinks off on the way between two.
 *
 * 30% rather than the middle: a link in the bar lands its section's top just
 * under the window's, and Experience is short enough that at 40% the line was
 * already in Skills — clicking one item lit up the next.
 *
 * Above the first section is the top of the page. In a section the bar has no
 * item for — certificates, contact — nothing is lit. The page's last sections
 * may never scroll up as far as the line; then the one above them stays lit,
 * which is the one whose item was clicked to get there.
 */
function current(tracked: SectionId[]): SectionId | "top" | null {
  const sections = [...document.querySelectorAll<HTMLElement>("main > section")];
  const line = window.innerHeight * 0.3;

  if (sections.length === 0 || line < sections[0].getBoundingClientRect().top) return "top";

  const passed = sections.findLast((section) => section.getBoundingClientRect().top <= line);
  const id = passed?.id as SectionId | undefined;

  return id && tracked.includes(id) ? id : null;
}

/**
 * The home page's bottom bar: back to the top, one item per section, and the
 * CV. The item for the section on screen is highlighted as the page scrolls.
 *
 * The links are plain fragments, so they work before — and without — this
 * component's script; the script only adds the highlight. It starts on "top",
 * which is where a fresh load lands, so the server's HTML is already right.
 */
export default function SectionNav({ sections, top, cv }: Props) {
  const [active, setActive] = useState<SectionId | "top" | null>("top");

  useEffect(() => {
    const tracked = sections.map((section) => section.id);
    let frame = 0;

    // At most once a frame, however fast the scroll events come.
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(current(tracked)));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sections]);

  return (
    <>
      {/* `#top` is the one fragment the browser scrolls to with no element of that id. */}
      <a
        href="#top"
        aria-label={top}
        title={top}
        aria-current={active === "top" ? "true" : undefined}
        className={`${ITEM} ${active === "top" ? ACTIVE : IDLE}`}
      >
        <UserIcon size={18} />
      </a>

      {sections.map(({ id, label }) => {
        const Icon = ICONS[id];
        const isActive = active === id;

        return (
          <a
            key={id}
            href={`#${id}`}
            // Named for screen readers and hover while the label is hidden;
            // from `lg` the label is visible and says the same.
            aria-label={label}
            title={label}
            aria-current={isActive ? "true" : undefined}
            className={`${ITEM} ${isActive ? ACTIVE : IDLE}`}
          >
            <Icon size={18} />
            <span className="hidden lg:inline">{label}</span>
          </a>
        );
      })}

      {/*
        A plain anchor, like the language switch in `CornerControls`, so the
        chosen theme survives the trip. Still the one filled item: the CV is
        the bar's call to action, the sections are only a way around.
      */}
      <a
        href={cv.href}
        aria-label={cv.label}
        className={`${ITEM} bg-accent text-on-accent hover:bg-accent-strong lg:ml-1`}
      >
        <FileIcon size={18} />
        <span className="hidden lg:inline">{cv.label}</span>
      </a>
    </>
  );
}
