/**
 * Every palette the site can be painted in, and the one place their colours
 * are written down. `themeCss()` turns this list into the stylesheet
 * `ThemeStyles` puts in the head; the picker draws its swatches from it; and
 * `themes.test.ts` holds each one to WCAG AA, so a new palette cannot ship with
 * text nobody can read.
 *
 * The names are places in Ecuador, like the palette the site started with:
 * "Andes" took the volcano green of Imbabura. They are proper nouns, so they
 * read the same in Spanish and English and need no dictionary entry.
 *
 * Pure data and strings — no `document`, no React — so the server, the client
 * and the tests can all import it.
 */

export type Palette = {
  background: string;
  foreground: string;
  /** Links and highlights. Clears 4.5:1 on the background and the surface. */
  accent: string;
  /** Hover on accent fills, and accent text laid over `accentSoft`. */
  accentStrong: string;
  /** A wash of the accent: badges, skill chips, the active item in the bar. */
  accentSoft: string;
  /** Text on an accent fill — the primary button. */
  onAccent: string;
  muted: string;
  /** Sits on top of the background: cards, the label over the map. */
  surface: string;
  /** A hairline for cards. Decorative, so it is allowed to be faint. */
  border: string;
  /** The outline of a text field: it has to be found, so 3:1 on both grounds. */
  field: string;
  danger: string;
  success: string;
};

export type Theme = {
  /** What lands in `data-theme` and `localStorage`. Never rename one. */
  id: string;
  name: string;
  /**
   * Whether it is a light or a dark palette. Native controls follow it through
   * `color-scheme`, and the map picks its street style by it.
   */
  scheme: "light" | "dark";
  palette: Palette;
};

/**
 * `light` and `dark` keep the ids the old two-way toggle wrote, so a visitor
 * who chose one before the picker existed still gets it.
 */
export const THEMES: readonly Theme[] = [
  {
    id: "light",
    name: "Andes",
    scheme: "light",
    // The volcano's green over a cool mist-white.
    palette: {
      background: "#f4f5f0",
      foreground: "#13201a",
      accent: "#1d6b4e",
      accentStrong: "#134a36",
      accentSoft: "#e2eee7",
      onAccent: "#ffffff",
      muted: "#56625b",
      surface: "#ffffff",
      border: "#d9ded7",
      field: "#7a8680",
      danger: "#b42318",
      success: "#15803d",
    },
  },
  {
    id: "dark",
    name: "Páramo",
    scheme: "dark",
    // The same green, lifted until it reads against a highland night.
    palette: {
      background: "#0e1512",
      foreground: "#eaf0eb",
      accent: "#6ccb9e",
      accentStrong: "#9be0be",
      accentSoft: "#183a2c",
      onAccent: "#0e1512",
      muted: "#9daba3",
      surface: "#17211d",
      border: "#2a3731",
      field: "#6e7e76",
      danger: "#f48678",
      success: "#4ade80",
    },
  },
  {
    id: "galapagos",
    name: "Galápagos",
    scheme: "light",
    // Sand, and the turquoise of the water off it.
    palette: {
      background: "#f6f1e7",
      foreground: "#10262b",
      accent: "#0b6e78",
      accentStrong: "#084c53",
      accentSoft: "#d6ece9",
      onAccent: "#ffffff",
      muted: "#55625f",
      surface: "#fffdf8",
      border: "#e3dccd",
      field: "#7d8580",
      danger: "#b42318",
      // A shade under Andes' green, which missed AA on the warmer sand by 0.04.
      success: "#12702f",
    },
  },
  {
    id: "cotopaxi",
    name: "Cotopaxi",
    scheme: "light",
    // Snow on the cone, and the lava under it.
    palette: {
      background: "#f3f4f6",
      foreground: "#1c1f26",
      accent: "#b4441a",
      accentStrong: "#7f2e10",
      accentSoft: "#fbe3d8",
      onAccent: "#ffffff",
      muted: "#575d68",
      surface: "#ffffff",
      border: "#dadde3",
      field: "#7b818c",
      danger: "#b42318",
      success: "#15803d",
    },
  },
  {
    id: "amazonia",
    name: "Amazonía",
    scheme: "dark",
    // The canopy at dusk, and a toucan's yellow.
    palette: {
      background: "#0b1a14",
      foreground: "#e6f2ea",
      accent: "#f0c04a",
      accentStrong: "#ffd97a",
      accentSoft: "#2d2d12",
      onAccent: "#0b1a14",
      muted: "#9fb5a8",
      surface: "#12261d",
      border: "#234034",
      field: "#6f8a7d",
      danger: "#f48678",
      success: "#4ade80",
    },
  },
  {
    id: "cacao",
    name: "Cacao",
    scheme: "dark",
    // Dark chocolate, and the gold of the pod.
    palette: {
      background: "#1c1310",
      foreground: "#f3e9e2",
      accent: "#e0a370",
      accentStrong: "#f2c39b",
      accentSoft: "#3a2620",
      onAccent: "#1c1310",
      muted: "#b8a59a",
      surface: "#261a16",
      border: "#3d2b25",
      field: "#8a7469",
      danger: "#f48678",
      success: "#4ade80",
    },
  },
];

export const THEME_IDS = THEMES.map((theme) => theme.id);

/** What a visitor who has chosen nothing gets, by their system setting. */
export const SYSTEM_THEMES = { light: "light", dark: "dark" } as const;

export function findTheme(id: string | null | undefined): Theme | undefined {
  return THEMES.find((theme) => theme.id === id);
}

/** `accentStrong` → `--accent-strong`, the names `app/globals.css` maps to Tailwind. */
function declarations(theme: Theme) {
  const variables = Object.entries(theme.palette).map(
    ([key, value]) =>
      `--${key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}:${value};`,
  );

  return `${variables.join("")}color-scheme:${theme.scheme};`;
}

/**
 * The stylesheet for every theme, in the order the cascade needs:
 *
 * 1. Bare `:root` gets the light default, so every colour exists for everyone.
 * 2. No choice made and a dark system: the dark default. `:not([data-theme])`
 *    rather than `:not([data-theme="light"])`, or a dark system would paint
 *    over a light theme like Galápagos.
 * 3. One rule per theme, for a choice made in the picker.
 * 4. Paper, last so it wins: always the light palette on white, since browsers
 *    leave backgrounds out of a print and a dark theme's text would land
 *    near-white on white paper.
 */
export function themeCss() {
  const light = findTheme(SYSTEM_THEMES.light)!;
  const dark = findTheme(SYSTEM_THEMES.dark)!;
  const paper: Theme = { ...light, palette: { ...light.palette, background: "#ffffff" } };

  return [
    `:root{${declarations(light)}}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme]){${declarations(dark)}}}`,
    ...THEMES.map((theme) => `:root[data-theme="${theme.id}"]{${declarations(theme)}}`),
    `@media print{:root,:root:not([data-theme]),:root[data-theme]{${declarations(paper)}}}`,
  ].join("\n");
}
