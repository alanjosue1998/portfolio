"use client";

import { useEffect, useId, useRef, useState } from "react";

import { BriefcaseIcon, CodeIcon, FileIcon, GridIcon, MenuIcon, TextIcon, UserIcon } from "./icons";

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
  /** The phone's menu button: what it says outside any section, and what it does. */
  menu: { label: string; open: string };
};

/**
 * Every item shares the bar's shape. Icon-only from `md` to `lg`; from `lg`
 * the sections spell out their names — at `md` they did fit, in Spanish, with
 * 6px to spare before the corner controls, and one more section would have
 * made the two overlap. Below `md` the sections fold into a menu instead.
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
export default function SectionNav({ sections, top, cv, menu }: Props) {
  const [active, setActive] = useState<SectionId | "top" | null>("top");
  const menuId = useId();
  const panel = useRef<HTMLDivElement>(null);

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

  /**
   * Every destination, the top of the page first. `#top` is the one fragment
   * the browser scrolls to with no element of that id.
   */
  const entries = [
    { id: "top" as const, href: "#top", label: top, Icon: UserIcon },
    ...sections.map(({ id, label }) => ({ id, href: `#${id}`, label, Icon: ICONS[id] })),
  ];

  const here = entries.find((entry) => entry.id === active);

  return (
    <>
      {/*
        Below `md`: one button that names the section on screen and opens the
        rest as a menu. Six icons in a row were a puzzle at 40px each; a word
        says where you are, and the menu says where else you can go.

        A native popover, like the theme picker's: Escape, a tap outside and
        the top layer come from the browser. Its name starts with the visible
        text, so voice control finds it by what it shows.
      */}
      <button
        type="button"
        popoverTarget={menuId}
        className={`${ITEM} gap-2 px-3 md:hidden ${here ? ACTIVE : IDLE}`}
      >
        <MenuIcon size={18} />
        {here?.label ?? menu.label}
        <span className="sr-only">, {menu.open}</span>
      </button>

      <div
        ref={panel}
        id={menuId}
        popover="auto"
        aria-label={menu.label}
        /*
         * Above the bar, from its left edge, where the button that opened it
         * sits: the bar is 48px tall at `bottom-4`, `bottom-6` from `sm`. It
         * rises and fades in, and out again, unless less motion is asked for.
         * `md:hidden` also closes it for good if the window grows past phones.
         */
        className="fixed inset-auto bottom-18 left-4 m-0 w-60 translate-y-2 rounded-2xl border border-border bg-surface p-1.5 text-foreground opacity-0 shadow-[0_12px_32px_-12px_rgb(0_0_0/0.4)] transition-[opacity,translate,display,overlay] transition-discrete duration-200 open:translate-y-0 open:opacity-100 motion-reduce:transition-none sm:bottom-20 md:hidden starting:open:translate-y-2 starting:open:opacity-0"
      >
        <ul className="flex flex-col gap-0.5">
          {entries.map(({ id, href, label, Icon }) => (
            <li key={id}>
              <a
                href={href}
                // The link scrolls; this puts the menu away so the section
                // it went to is what is left on screen.
                onClick={() => panel.current?.hidePopover()}
                aria-current={active === id ? "true" : undefined}
                className={`flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition-colors ${active === id ? ACTIVE : IDLE}`}
              >
                <Icon size={18} />
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* From `md`: every destination in the bar itself. */}
      {entries.map(({ id, href, label, Icon }) => {
        const isActive = active === id;

        return (
          <a
            key={id}
            href={href}
            // Named for screen readers and hover while the label is hidden;
            // from `lg` the label is visible and says the same. The top of the
            // page keeps to its icon at every width.
            aria-label={label}
            title={label}
            aria-current={isActive ? "true" : undefined}
            className={`${ITEM} max-md:hidden ${isActive ? ACTIVE : IDLE}`}
          >
            <Icon size={18} />
            {id !== "top" && <span className="hidden lg:inline">{label}</span>}
          </a>
        );
      })}

      {/*
        A plain anchor, like the language switch in `CornerControls`, so the
        chosen theme survives the trip. Still the one filled item: the CV is
        the bar's call to action, the sections are only a way around. Its
        label shows wherever there is room for it: on a phone, beside the
        menu, and from `lg`.
      */}
      <a
        href={cv.href}
        aria-label={cv.label}
        className={`${ITEM} bg-accent px-3 text-on-accent hover:bg-accent-strong md:px-0 lg:ml-1 lg:px-4`}
      >
        <FileIcon size={18} />
        <span className="md:max-lg:hidden">{cv.label}</span>
      </a>
    </>
  );
}
