/**
 * The networks the admin form offers as presets.
 *
 * `ContactLink.platform` is a plain string in the schema, not an enum, so this
 * list is a convenience rather than a constraint: it fills the select and picks
 * the icon, and a value that is not here still stores and renders — it just
 * gets the generic mark. Adding a network is a line in this file.
 */
export const contactPlatforms = [
  { value: "email", label: "Email" },
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "cv", label: "CV (PDF)" },
  { value: "x", label: "X / Twitter" },
  { value: "other", label: "Otro enlace" },
] as const;

export type ContactPlatform = (typeof contactPlatforms)[number]["value"];
