import type { AdminDictionary } from "@/lib/admin-i18n";

import type { FormState } from "./actions";

/**
 * The pieces every form in the panel is built from, so they look alike and
 * follow the theme from one place. All colours are tokens from
 * `app/globals.css`; a fixed grey here would vanish against the dark ground.
 *
 * `border-foreground/25` rather than the `border` token for inputs: that one is
 * a hairline meant for cards, too faint to find a text field by.
 */
export const FIELD = "rounded border border-foreground/25 bg-surface px-3 py-2";

export const HINT = "text-sm text-muted";

export const SUBMIT =
  "self-start rounded bg-foreground px-4 py-2 text-background disabled:opacity-60";

/** A row in one of the lists under each form. */
export const ITEM = "flex items-start justify-between gap-4 rounded border border-border p-4";

export const DELETE = "text-sm text-danger underline";

/** What the last submission came back with. `role="alert"` reads it out. */
export function FormStatus({ state }: { state: FormState }) {
  if (!state) return null;

  return (
    <p role="alert" className={state.status === "error" ? "text-danger" : "text-success"}>
      {state.message}
    </p>
  );
}

type BilingualFieldProps = {
  /** The Spanish field's name; the English one is the same with `En` added. */
  name: string;
  /** Prepended to the ids, so a form open in an `EditDialog` does not reuse the
      ids of the create form on the page behind it. */
  idPrefix?: string;
  /** The stored values, when editing. */
  defaultValue?: string | null;
  defaultValueEn?: string | null;
  label: string;
  labels: Pick<AdminDictionary["common"], "spanish" | "english" | "englishHint">;
  /** Applies to the Spanish field only: the English one is always optional. */
  required?: boolean;
  /** A textarea of this many rows, rather than a single-line input. */
  rows?: number;
  placeholder?: string;
  /** A `datalist` id to suggest from, on the Spanish field. */
  list?: string;
  /** Under both, for what applies to the pair. */
  hint?: string;
};

/**
 * A text stored in both languages — `role` and `roleEn`, say — as one labelled
 * pair. Spanish is the text every page can fall back to, so it carries the
 * `required`; the English half only says what `/en` shows instead.
 */
export function BilingualField({
  name,
  idPrefix = "",
  defaultValue,
  defaultValueEn,
  label,
  labels,
  required,
  rows,
  placeholder,
  list,
  hint,
}: BilingualFieldProps) {
  const english = `${name}En`;
  const spanishId = `${idPrefix}${name}`;
  const englishId = `${idPrefix}${english}`;
  const Control = rows ? "textarea" : "input";

  return (
    <fieldset className="flex flex-col gap-1">
      <legend className="mb-1">{label}</legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={spanishId} className={HINT}>
            {labels.spanish}
          </label>
          <Control
            id={spanishId}
            name={name}
            lang="es"
            defaultValue={defaultValue ?? undefined}
            rows={rows}
            required={required}
            placeholder={placeholder}
            list={list}
            className={FIELD}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={englishId} className={HINT}>
            {labels.english}
          </label>
          <Control
            id={englishId}
            name={english}
            lang="en"
            rows={rows}
            defaultValue={defaultValueEn ?? undefined}
            aria-describedby={`${englishId}-hint`}
            className={FIELD}
          />
          <p id={`${englishId}-hint`} className={HINT}>
            {labels.englishHint}
          </p>
        </div>
      </div>

      {hint && <p className={HINT}>{hint}</p>}
    </fieldset>
  );
}

/** A stored first-of-the-month date as `<input type="month">` wants it, in UTC. */
export function monthValue(date: Date | null | undefined) {
  return date ? date.toISOString().slice(0, 7) : undefined;
}
