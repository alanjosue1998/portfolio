"use client";

import { useId, useSyncExternalStore } from "react";

import { PaletteIcon } from "./icons";
import { applyTheme, chosenTheme, subscribeToTheme } from "./theme";
import { findTheme, SYSTEM_THEMES, THEMES, type Palette } from "./themes";

export type ThemeLabels = {
  /** The button's name, and the panel's heading. */
  label: string;
  /** The card that hands the choice back to the system. */
  auto: string;
  autoHint: string;
};

type Props = {
  labels: ThemeLabels;
  /** The shape it shares with the language control — see `CornerControls`. */
  className: string;
};

/** Nothing is chosen on the server: it cannot read `localStorage`. */
function readServerTheme() {
  return null;
}

/** The five colours a card shows: enough to tell the palettes apart at a glance. */
const SWATCHES: (keyof Palette)[] = ["accent", "accentSoft", "muted", "surface", "foreground"];

function Swatches({ colors }: { colors: string[] }) {
  return (
    <span aria-hidden="true" className="flex">
      {colors.map((color, index) => (
        <span
          key={index}
          // Overlapping a little, each ringed so a light dot holds its edge
          // on a light card.
          className="-ml-1 size-4 rounded-full ring-1 ring-black/15 first:ml-0"
          style={{ background: color }}
        />
      ))}
    </span>
  );
}

const CARD =
  "flex flex-col items-start gap-2 rounded-xl border p-3 text-left text-sm font-medium transition-[outline-color,translate] outline-2 outline-offset-2 outline-transparent hover:-translate-y-0.5 aria-pressed:outline-accent";

/**
 * The corner button that opens a panel of every theme, each card painted in its
 * own colours so it shows what it would do, plus one that goes back to
 * following the system.
 *
 * A native popover (`popover` + `popoverTarget`), so opening, closing on
 * Escape or on a click outside, and keeping the panel above everything come
 * from the browser rather than from state here. The panel stays open after a
 * pick, so trying the palettes one after another is a row of clicks.
 */
export default function ThemePicker({ labels, className }: Props) {
  const chosen = useSyncExternalStore(subscribeToTheme, chosenTheme, readServerTheme);
  const panel = useId();
  const heading = useId();

  const light = findTheme(SYSTEM_THEMES.light)!.palette;
  const dark = findTheme(SYSTEM_THEMES.dark)!.palette;

  return (
    <>
      <button
        type="button"
        popoverTarget={panel}
        aria-label={labels.label}
        title={labels.label}
        className={className}
      >
        <PaletteIcon />
      </button>

      <div
        id={panel}
        popover="auto"
        role="dialog"
        aria-labelledby={heading}
        /*
         * Pinned above the corner controls: they stand 112px tall from the
         * bottom on a phone and 120px from `sm`, and the panel clears both
         * with a little air. `inset-auto` and `m-0` undo the browser's
         * centring of a popover.
         */
        className="fixed inset-auto right-4 bottom-31 m-0 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-4 text-foreground shadow-[0_12px_32px_-12px_rgb(0_0_0/0.4)] sm:right-6 sm:bottom-33"
      >
        <h2 id={heading} className="mb-3 text-base">
          {labels.label}
        </h2>

        <div className="grid grid-cols-2 gap-2.5">
          {/* Following the system: half of each default, the way it behaves. */}
          <button
            type="button"
            onClick={() => applyTheme(null)}
            aria-pressed={chosen === null}
            className={`${CARD} col-span-2 border-border`}
            style={{
              background: `linear-gradient(135deg, ${light.background} 50%, ${dark.background} 50%)`,
            }}
          >
            <span className="rounded-md bg-surface/90 px-1.5 text-foreground">
              {labels.auto} <span className="font-normal text-muted">· {labels.autoHint}</span>
            </span>
            <Swatches colors={[light.accent, light.surface, dark.accent, dark.surface]} />
          </button>

          {THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => applyTheme(theme.id)}
              aria-pressed={chosen === theme.id}
              className={CARD}
              style={{
                background: theme.palette.background,
                color: theme.palette.foreground,
                borderColor: theme.palette.border,
              }}
            >
              {theme.name}
              <Swatches colors={SWATCHES.map((key) => theme.palette[key])} />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

/**
 * The same choice as the picker, folded into a row of discs for the phone's
 * section menu, where the corner controls give way to it. Each disc is half the
 * theme's ground and half its accent, which is what tells the palettes apart
 * at this size; the automatic one is half Andes, half Páramo.
 */
export function ThemeSwatches({ labels }: { labels: ThemeLabels }) {
  const chosen = useSyncExternalStore(subscribeToTheme, chosenTheme, readServerTheme);

  const light = findTheme(SYSTEM_THEMES.light)!.palette;
  const dark = findTheme(SYSTEM_THEMES.dark)!.palette;

  const options = [
    { id: null, name: labels.auto, a: light.background, b: dark.background },
    ...THEMES.map((theme) => ({
      id: theme.id,
      name: theme.name,
      a: theme.palette.background,
      b: theme.palette.accent,
    })),
  ];

  return (
    <div role="group" aria-label={labels.label} className="flex flex-wrap gap-2">
      {options.map(({ id, name, a, b }) => (
        <button
          key={id ?? "auto"}
          type="button"
          onClick={() => applyTheme(id)}
          aria-pressed={chosen === id}
          aria-label={name}
          title={name}
          className="size-8 rounded-full ring-1 ring-black/15 outline-2 outline-offset-2 outline-transparent transition-[outline-color] aria-pressed:outline-accent"
          style={{ background: `linear-gradient(135deg, ${a} 50%, ${b} 50%)` }}
        />
      ))}
    </div>
  );
}
