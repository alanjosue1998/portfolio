"use client";

import { useSyncExternalStore } from "react";

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
       * Both icons ship in the markup and CSS shows one. Drawn here rather than
       * pulled from an icon package, like the bars in `Menu`.
       */}
      <svg
        className="theme-icon-sun"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="10" cy="10" r="3.5" />
        <path d="M10 4.5V2.5M10 15.5V17.5M4.5 10H2.5M15.5 10H17.5M13.9 6.1L15.3 4.7M6.1 6.1L4.7 4.7M13.9 13.9L15.3 15.3M6.1 13.9L4.7 15.3" />
      </svg>

      <svg
        className="theme-icon-moon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17.5 10.7A7.5 7.5 0 1 1 9.3 2.5A5.8 5.8 0 0 0 17.5 10.7Z" />
      </svg>
    </button>
  );
}
