import { getDictionary } from "@/lib/dictionaries";
import prisma from "@/lib/prisma";

/**
 * One path per network, drawn on a 24×24 grid so they all sit at the same
 * optical weight. `currentColor` lets each mark inherit the link's colour
 * rather than carrying its own, which keeps them legible in both themes.
 */
const icons: Record<string, React.ReactNode> = {
  github: (
    <path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" />
  ),
  linkedin: (
    <>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM3 9h4v12H3z" />
      <path d="M14.5 8.75c-1.9 0-3 .98-3.5 1.9V9H7v12h4v-6.6c0-1.4.8-2.4 2-2.4s2 1 2 2.4V21h4v-7.2c0-3.1-1.7-5.05-4.5-5.05Z" />
    </>
  ),
  x: (
    <path d="M17.53 3h3.05l-6.66 7.61L21.75 21h-6.13l-4.8-6.28L5.32 21H2.27l7.12-8.14L2.25 3h6.29l4.34 5.74L17.53 3Zm-1.07 16.17h1.69L7.62 4.74H5.8l10.66 14.43Z" />
  ),
  email: (
    <>
      <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" fill="none" strokeWidth="1.8" />
      <path d="m3.5 7 8.5 6 8.5-6" fill="none" strokeWidth="1.8" strokeLinecap="round" />
    </>
  ),
  cv: (
    <>
      <path
        d="M6.5 2.5h7l4.5 4.5v14a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z"
        fill="none"
        strokeWidth="1.8"
      />
      <path d="M13.5 2.5V7H18" fill="none" strokeWidth="1.8" />
    </>
  ),
  other: (
    <path
      d="M10 13.5a3.5 3.5 0 0 0 5 0l3-3a3.54 3.54 0 0 0-5-5l-1 1m-1 3a3.5 3.5 0 0 0-5 0l-3 3a3.54 3.54 0 0 0 5 5l1-1"
      fill="none"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  ),
};

function Icon({ platform }: { platform: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      aria-hidden="true"
      className="shrink-0"
    >
      {icons[platform] ?? icons.other}
    </svg>
  );
}

export default async function Contact() {
  const [dict, links] = await Promise.all([
    getDictionary(),
    prisma.contactLink.findMany({
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  // A heading over an empty list says less than nothing.
  if (links.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2>{dict.contact.heading}</h2>

      <ul className="flex flex-wrap gap-3">
        {links.map((link) => {
          /**
           * A `mailto:` opens the mail client in place, so sending it to a new
           * tab would leave an empty one behind. Everything else leaves the
           * site and gets `noreferrer` with it.
           */
          const external = !link.url.startsWith("mailto:");

          return (
            <li key={link.id}>
              <a
                href={link.url}
                {...(external && { target: "_blank", rel: "noreferrer" })}
                className="flex items-center gap-2 rounded border border-border px-3 py-2 text-foreground transition-colors hover:border-accent hover:text-accent"
              >
                <Icon platform={link.platform} />
                {link.label}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
