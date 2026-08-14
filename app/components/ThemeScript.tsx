/**
 * Applies a saved theme before the browser paints.
 *
 * The pages are prerendered, so their HTML carries no theme: without this the
 * site would flash the system colours and only switch to the chosen ones once
 * React had hydrated. Reading `localStorage` from a blocking inline script in
 * the head happens before the first paint, so there is nothing to see.
 *
 * `localStorage` throws rather than returns null when a browser blocks storage,
 * hence the try. Missing or unrecognised values are left alone, which leaves
 * `prefers-color-scheme` in charge — see `app/globals.css`.
 */
const script = `
try {
  var t = localStorage.getItem("theme");
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
} catch (e) {}
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
