/**
 * The networks the admin form offers as presets.
 *
 * `ContactLink.platform` is a plain string in the schema, not an enum. This
 * list fills the select and is what `saveContactLink` checks against: a value
 * that is not here is stored as `other`, and one already in the database from
 * before renders with the generic mark. Adding a network is a line in this
 * file, plus its icon in `app/components/Contact.tsx`.
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
