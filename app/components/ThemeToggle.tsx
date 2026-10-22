"use client";

import { useSyncExternalStore } from "react";

import { MoonIcon, SunIcon } from "./icons";
import { applyTheme, resolvedTheme, subscribeToTheme, type ResolvedTheme } from "./theme";

export type ThemeLabels = {
  /** Read out while the light theme is on, so the name says what a click does. */
  toDark: string;
  toLight: string;
};

type Props = {
  labels: ThemeLabels;
  /** The shape it shares with the language control — see `CornerControls`. */
  className: string;
};

/**
 * Nothing is chosen while rendering on the server and there is no system setting
 * to read either, so the fallback the palette uses is the honest answer. It only
 * decides the accessible name until React hydrates; the icon is not its business
 * — see `app/globals.css`.
 */
function readServerTheme(): ResolvedTheme {
  return "light";
}

/**
 * A sun while the page is light, a moon while it is dark: the icon names the
 * theme that is on, not the one a click would bring. Where it sits and what it
 * looks like belong to `CornerControls`, which owns the corner.
 *
 * There is no third state for "follow the system". A visitor who has never
 * clicked is already following it — that is what no `data-theme` attribute
 * means — and a two-icon button is the trade for switching in one click.
 */
export default function ThemeToggle({ labels, className }: Props) {
  const theme = useSyncExternalStore(subscribeToTheme, resolvedTheme, readServerTheme);

  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      /*
       * The name changes with the theme, which is what a screen reader needs to
       * hear. `aria-pressed` would be the wrong tool: neither theme is the
       * button being "on".
       */
      aria-label={theme === "dark" ? labels.toLight : labels.toDark}
      className={className}
    >
      {/*
       * Both icons ship in the markup and CSS shows one. They come from
       * `./icons`, like every other icon on the site.
       */}
      <SunIcon className="theme-icon-sun" />
      <MoonIcon className="theme-icon-moon" />
    </button>
  );
}
