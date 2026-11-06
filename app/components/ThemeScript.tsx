import { THEME_COLOR_ATTRIBUTE, THEME_IDS, themeColors, themeCss } from "./themes";

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
 *
 * It also writes the `theme-color` tags — see `themeColors` — so the browser's
 * toolbar starts out in the chosen theme too. That part sits outside the `try`,
 * so a browser that blocks storage still gets the system pair. Wrapped in a
 * function so none of its names land on `window`.
 */
const colors = Object.fromEntries([...THEME_IDS, ""].map((id) => [id, themeColors(id || null)]));

export const themeScript = `
(function () {
  var t = "";
  try {
    var s = localStorage.getItem("theme");
    if (${JSON.stringify(THEME_IDS)}.indexOf(s) > -1) {
      document.documentElement.dataset.theme = s;
      t = s;
    }
  } catch (e) {}
  var colors = ${JSON.stringify(colors)};
  colors[t].forEach(function (c) {
    var m = document.createElement("meta");
    m.name = "theme-color";
    m.content = c.color;
    if (c.media) m.media = c.media;
    m.setAttribute("${THEME_COLOR_ATTRIBUTE}", "");
    document.head.appendChild(m);
  });
})();
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
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
    </>
  );
}
