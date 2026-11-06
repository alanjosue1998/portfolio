import type { Locale } from "./i18n";

/**
 * The words on the two error screens, in each locale.
 *
 * Not in `dictionaries/*.json` like everything else, because both screens are
 * Client Components — error boundaries have to be — and `getDictionary` only
 * runs on the server. Importing a whole dictionary into them would ship every
 * string on the site to the browser to show three of them.
 */
export const errorCopy: Record<
  Locale,
  { title: string; heading: string; body: string; retry: string; home: string }
> = {
  es: {
    title: "Algo salió mal",
    heading: "Algo salió mal",
    body: "La página no se pudo cargar. Puede ser algo pasajero: vuelve a intentarlo en un momento.",
    retry: "Intentar de nuevo",
    home: "Volver al inicio",
  },
  en: {
    title: "Something went wrong",
    heading: "Something went wrong",
    body: "The page couldn't load. It may be temporary — try again in a moment.",
    retry: "Try again",
    home: "Back to the home page",
  },
};
