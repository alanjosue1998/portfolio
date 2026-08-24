/**
 * The theme lives in one place: the `data-theme` attribute on <html>. The inline
 * script in `ThemeScript` puts it there before the first paint, `app/globals.css`
 * reads it, and everything that has to follow it reads it from there rather than
 * keeping a copy in React state — so there is no second source to drift.
 *
 * Browser only. Every function here touches `document` or `window`.
 */

/** What the page is painted as once the system setting has had its say. */
export type ResolvedTheme = "light" | "dark";

const DARK_SETTING = "(prefers-color-scheme: dark)";

/**
 * The same three-state rule the colours follow: an explicit choice wins, and
 * nothing chosen hands the decision to the system. Only two values come out of
 * it, because "follow the system" is a way of picking one of these, not a third
 * thing the page can look like.
 */
export function resolvedTheme(): ResolvedTheme {
  const chosen = document.documentElement.dataset.theme;

  if (chosen === "light" || chosen === "dark") return chosen;

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

  // Another tab choosing a theme writes to storage, not to this document.
  window.addEventListener("storage", onChange);

  return () => {
    attribute.disconnect();
    systemSetting.removeEventListener("change", onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** Records the choice, for this page and for the next visit. */
export function applyTheme(next: ResolvedTheme) {
  document.documentElement.dataset.theme = next;

  try {
    localStorage.setItem("theme", next);
  } catch {
    // Storage blocked: the colours still change, only the memory of it is lost.
  }
}
