import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

import { FileIcon, GitHubIcon, LinkIcon, LinkedInIcon, MailIcon, XIcon } from "./icons";
import SectionHeading from "./SectionHeading";

/**
 * One icon per network, all from `./icons` so they share a grid and a weight.
 * Anything the admin stores that is not here gets the generic link.
 */
const icons: Record<string, React.ComponentType> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  x: XIcon,
  email: MailIcon,
  cv: FileIcon,
  other: LinkIcon,
};

export default async function Contact() {
  const [dict, links] = await Promise.all([
    getDictionary(),
    prisma.contactLink.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  // A heading over an empty list says less than nothing.
  if (links.length === 0) return null;

  /**
   * Set on a surface of its own rather than left on the page like the other
   * sections: it is where the page is meant to end up, and it should read as
   * a destination rather than one more list.
   */
  return (
    <section className="flex flex-col gap-5 rounded-[20px] border border-border bg-surface p-6 sm:p-8">
      <div className="flex flex-col gap-2">
        <SectionHeading>{dict.contact.heading}</SectionHeading>
        <p className="text-muted">{dict.contact.subtitle}</p>
      </div>

      <ul className="flex flex-wrap gap-2.5">
        {links.map((link) => {
          /**
           * A `mailto:` opens the mail client in place, so sending it to a new
           * tab would leave an empty one behind. Everything else leaves the
           * site and gets `noreferrer` with it.
           */
          const external = !link.url.startsWith("mailto:");
          const Icon = icons[link.platform] ?? icons.other;

          return (
            <li key={link.id}>
              <a
                href={link.url}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                className="flex h-11 items-center gap-2.5 rounded-[10px] border border-border bg-background px-4 font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Icon />
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
