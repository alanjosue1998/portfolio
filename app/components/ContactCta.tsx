import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

/**
 * The call to action under the tagline. A plain anchor holding the `mailto:`
 * exactly as it is stored, so the click opens the visitor's mail client
 * already addressed — there is nothing here to hydrate and no client
 * JavaScript shipped for it.
 *
 * The address is the `email` contact link rather than a constant, so `/admin`
 * stays the one place it is edited and the list at the bottom of the page is
 * drawing from the same row.
 */
export default async function ContactCta() {
  const [dict, link] = await Promise.all([
    getDictionary(),
    prisma.contactLink.findFirst({
      where: { platform: "email" },
      // The admin can hold more than one; the first in its order is the one
      // that already reads as primary everywhere else on the site.
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  // Nothing to write to, so there is nothing worth a button either.
  if (!link) return null;

  /**
   * No `target="_blank"`: a `mailto:` hands off to the mail client in place,
   * and a new tab would only be left behind empty — the same reasoning
   * `Contact` applies to the link list at the bottom.
   */
  return (
    <a
      href={link.url}
      className="self-start rounded bg-accent px-4 py-2 font-semibold text-background transition-opacity hover:opacity-90"
    >
      {dict.contact.cta}
    </a>
  );
}
