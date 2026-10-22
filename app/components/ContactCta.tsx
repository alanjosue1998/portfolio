import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

import { DownloadIcon, MailIcon } from "./icons";

/**
 * The shape both buttons share: 44px tall so they are a comfortable target on a
 * phone, and the same radius as every other control on the page.
 */
const BUTTON =
  "inline-flex h-11 items-center gap-2 rounded-[10px] px-[18px] font-semibold transition-colors";

/**
 * The calls to action under the tagline. Plain anchors holding the URLs exactly
 * as they are stored, so there is nothing here to hydrate and no client
 * JavaScript shipped for them.
 *
 * Both come from the contact links rather than constants, so `/admin` stays the
 * one place they are edited and the list at the bottom of the page is drawing
 * from the same rows.
 */
export default async function ContactCta() {
  const [dict, links] = await Promise.all([
    getDictionary(),
    prisma.contactLink.findMany({
      where: { platform: { in: ["email", "cv"] } },
      // The admin can hold more than one of each; the first in its order is
      // the one that already reads as primary everywhere else on the site.
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const email = links.find((link) => link.platform === "email");
  const cv = links.find((link) => link.platform === "cv");

  // Nothing to write to, so there is nothing worth a button either. The CV
  // alone does not make a call to action; it waits for the email.
  if (!email) return null;

  return (
    <div className="flex flex-wrap gap-3">
      {/*
        No `target="_blank"`: a `mailto:` hands off to the mail client in
        place, and a new tab would only be left behind empty — the same
        reasoning `Contact` applies to the link list at the bottom.
      */}
      <a href={email.url} className={`${BUTTON} bg-accent text-on-accent hover:bg-accent-strong`}>
        <MailIcon size={18} />
        {dict.contact.cta}
      </a>

      {cv && (
        <a
          href={cv.url}
          target="_blank"
          rel="noreferrer"
          className={`${BUTTON} border border-border bg-surface text-foreground hover:border-accent hover:text-accent`}
        >
          <DownloadIcon size={18} />
          {dict.contact.cv}
        </a>
      )}
    </div>
  );
}
