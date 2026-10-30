/**
 * The theme lives in one place: the `data-theme` attribute on <html>. The inline
 * script in `ThemeScript` puts it there before the first paint, the stylesheet
 * generated from `themes.ts` reads it, and everything that has to follow it
 * reads it from there rather than keeping a copy in React state — so there is
 * no second source to drift.
 *
 * No attribute means nothing has been chosen, and the system setting picks
 * between Andes and Páramo.
 *
 * Browser only. Every function here touches `document` or `window`.
 */

import { findTheme } from "./themes";

/** Whether what is painted is a light or a dark palette. */
export type ResolvedTheme = "light" | "dark";

const DARK_SETTING = "(prefers-color-scheme: dark)";
const STORAGE_KEY = "theme";

/** The theme chosen in the picker, or null while the system decides. */
export function chosenTheme(): string | null {
  return findTheme(document.documentElement.dataset.theme)?.id ?? null;
}

/**
 * Light or dark, whichever palette is on: the chosen theme's own scheme, or the
 * system setting when nothing is chosen. The map picks its street style by this.
 */
export function resolvedTheme(): ResolvedTheme {
  const chosen = findTheme(document.documentElement.dataset.theme);

  if (chosen) return chosen.scheme;

  return window.matchMedia(DARK_SETTING).matches ? "dark" : "light";
}

/**
 * Runs `onChange` whenever the painted theme may have changed, by any of the
 * three routes into it: a choice made in this tab, one made in another, and the
 * system setting moving while nothing is chosen here.
 */
export function subscribeToTheme(onChange: () => void) {
  const attribute = new MutationObserver(onChange);

  attribute.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const systemSetting = window.matchMedia(DARK_SETTING);
  systemSetting.addEventListener("change", onChange);

  /**
   * Another tab choosing a theme writes to storage, not to this document, so
   * the value is copied across here. The observer above then sees the
   * attribute change and calls `onChange` — calling it directly would only
   * re-read this tab's own, unchanged attribute.
   */
  function fromAnotherTab(event: StorageEvent) {
    if (event.key !== STORAGE_KEY) return;

    const html = document.documentElement;
    const theme = findTheme(event.newValue);

    if (theme) {
      html.dataset.theme = theme.id;
    } else {
      delete html.dataset.theme;
    }
  }

  window.addEventListener("storage", fromAnotherTab);

  return () => {
    attribute.disconnect();
    systemSetting.removeEventListener("change", onChange);
    window.removeEventListener("storage", fromAnotherTab);
  };
}

/**
 * Records the choice, for this page and for the next visit. Null goes back to
 * following the system.
 *
 * Wrapped in a view transition where the browser has one, so the page fades
 * from one palette to the next instead of snapping — unless the visitor asked
 * for less motion, or the browser cannot, in which case it simply switches.
 */
export function applyTheme(id: string | null) {
  const change = () => {
    const html = document.documentElement;

    if (id) {
      html.dataset.theme = id;
    } else {
      delete html.dataset.theme;
    }

    try {
      if (id) {
        localStorage.setItem(STORAGE_KEY, id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage blocked: the colours still change, only the memory of it is lost.
    }
  };

  const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (calm || !document.startViewTransition) {
    change();
  } else {
    document.startViewTransition(change);
  }
}
