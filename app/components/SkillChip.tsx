/**
 * A skill and its logo, drawn in the chip's own colour so every brand sits in
 * the theme rather than in its own palette. The logo's path comes from
 * `lib/skill-icons.ts`, looked up on the server; a skill Simple Icons does not
 * know arrives with none and gets its initial in a disc of the same size, so
 * no chip is missing a mark.
 *
 * No directive: it renders on the server in the static list and in the client
 * in the moving lane alike.
 */
export default function SkillChip({ name, icon }: { name: string; icon: string | null }) {
  return (
    <span className="flex items-center gap-2 rounded-full bg-accent-soft py-2 pr-4 pl-3 text-sm font-medium whitespace-nowrap text-accent-strong">
      {icon ? (
        <svg
          viewBox="0 0 24 24"
          width={18}
          height={18}
          fill="currentColor"
          aria-hidden="true"
          className="shrink-0"
        >
          <path d={icon} />
        </svg>
      ) : (
        <span
          aria-hidden="true"
          className="grid size-[18px] shrink-0 place-items-center rounded-full bg-accent-strong text-[10px] font-bold text-accent-soft"
        >
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      {name}
    </span>
  );
}
