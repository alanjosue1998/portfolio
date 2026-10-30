/**
 * The shape every item in the bar shares, so a link and a button sitting side
 * by side read as one control set. Exported for the items themselves:
 * `CvPrintButton` is a Client Component and cannot be handed a class from here
 * any other way.
 */
export const BAR_ITEM =
  "inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm whitespace-nowrap font-semibold transition-colors hover:text-accent";

/** The item the bar is there for: filled, so it is the one the eye lands on. */
export const BAR_ITEM_PRIMARY =
  "inline-flex h-11 items-center gap-2 rounded-full bg-accent px-4 text-sm whitespace-nowrap font-semibold text-on-accent transition-colors hover:bg-accent-strong";

/**
 * A pill pinned to the bottom centre of the viewport, holding the page's
 * actions — the CV for now, with room for more.
 *
 * Rendered by each page rather than by the layout, because what belongs in it
 * depends on the page: the portfolio offers the CV, the CV offers the PDF and
 * the way back. Children rather than a list of props, so a new action is one
 * more element and not a change here.
 *
 * `bottom-4` / `sm:bottom-6`, level with `CornerControls`, which sits in the
 * right-hand corner on the same line.
 *
 * Below `md` the bar is pinned to the left rather than centred. The home
 * page's holds the section menu, named after the section on screen, and the
 * CV with its label — about 250px, which centred, clearing the controls on
 * both sides, a 375px phone does not have. From the left it only has to clear
 * them on the right — their 44px, their 16px inset, its own 16px and a little
 * air, 5.5rem in all. The menu opens from the same left edge. From `md` there
 * is room to centre it again, which takes that clearance from both sides —
 * 4.5rem a side, 9rem in all.
 *
 * `no-print`: neither the bar nor the space reserved for it has any business on
 * paper.
 */
export default function BottomBar({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <nav
      aria-label={label}
      className="no-print fixed bottom-4 left-4 z-20 flex max-w-[calc(100vw-5.5rem)] items-center gap-0.5 rounded-full border border-border bg-surface p-1 text-foreground shadow-[0_6px_18px_-8px_rgb(0_0_0/0.35)] sm:bottom-6 md:left-1/2 md:max-w-[calc(100vw-9rem)] md:-translate-x-1/2 md:gap-1"
    >
      {children}
    </nav>
  );
}
