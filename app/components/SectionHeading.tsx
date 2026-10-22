/**
 * The title every section opens with: its number, the heading, and a hairline
 * running out to the edge of the column.
 *
 * The number is a CSS counter — see `.section-count` in `app/globals.css` — so a
 * section that renders nothing does not leave a gap in the count. It is
 * `aria-hidden` because it is ornament: the outline is already in the headings.
 */
export default function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3.5">
      <span aria-hidden="true" className="section-count font-mono text-sm text-accent" />
      <h2>{children}</h2>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}
