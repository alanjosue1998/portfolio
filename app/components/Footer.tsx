import { getDictionary } from "@/lib/dictionaries";

/**
 * Closes the page. Without it the contact block was the last thing on screen
 * and the page simply stopped, with the corner controls floating over nothing.
 *
 * The year is the build's: the page is prerendered, so it updates with the next
 * deploy rather than at midnight on the first of January, which is close enough.
 */
export default async function Footer() {
  const dict = await getDictionary();

  return (
    <footer className="mx-auto mt-16 flex w-full max-w-3xl flex-wrap justify-between gap-2 border-t border-border px-4 pt-6 pb-24 text-sm text-muted sm:px-6 sm:pb-10">
      <span>
        © {new Date().getFullYear()} {dict.footer.name}
      </span>
      <span>{dict.footer.place}</span>
    </footer>
  );
}
