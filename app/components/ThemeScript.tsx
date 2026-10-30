import { THEME_IDS, themeCss } from "./themes";

/**
 * Applies a saved theme before the browser paints.
 *
 * The pages are prerendered, so their HTML carries no theme: without this the
 * site would flash the system colours and only switch to the chosen ones once
 * React had hydrated. Reading `localStorage` from a blocking inline script in
 * the head happens before the first paint, so there is nothing to see.
 *
 * `localStorage` throws rather than returns null when a browser blocks storage,
 * hence the try. Only a known theme id is applied — a stale or tampered value is
 * left alone, which leaves `prefers-color-scheme` in charge.
 */
const script = `
try {
  var t = localStorage.getItem("theme");
  if (${JSON.stringify(THEME_IDS)}.indexOf(t) > -1) document.documentElement.dataset.theme = t;
} catch (e) {}
`;

/**
 * Both halves of the theme, in the head of each root layout: the palettes —
 * generated from `themes.ts`, the one place their colours are written — and
 * the script that picks one before the first paint.
 */
export default function ThemeScript() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeCss() }} />
      <script dangerouslySetInnerHTML={{ __html: script }} />
    </>
  );
}
