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
