/**
 * The shape the corner controls share — the language and the theme, on the
 * public site (`CornerControls`) and in the panel (`AdminControls`). One string
 * rather than copies of it: they are the same object in different states, and
 * a border that only matched on one of them would read as a mistake.
 */
export const CONTROL =
  "flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)] transition-colors hover:border-accent hover:text-accent";
