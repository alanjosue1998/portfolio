"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { AdminDictionary } from "@/lib/admin-i18n";

type Labels = AdminDictionary["layout"]["nav"];

const sections: { href: string; key: keyof Labels }[] = [
  { href: "/admin", key: "profile" },
  { href: "/admin/skills", key: "skills" },
  { href: "/admin/projects", key: "projects" },
  { href: "/admin/certificates", key: "certificates" },
  { href: "/admin/experience", key: "experience" },
  { href: "/admin/education", key: "education" },
];

type Props = {
  label: string;
  labels: Labels;
};

export default function AdminNav({ label, labels }: Props) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className="sm:w-56 sm:shrink-0">
      <ul className="flex gap-2 overflow-x-auto sm:flex-col sm:gap-1 sm:overflow-visible">
        {sections.map((section) => {
          /**
           * `/admin` is the parent of every other section, so a `startsWith`
           * test would light it up on all of them. It is matched exactly and
           * the rest by prefix, which leaves room for a future child route
           * without the tab going dark.
           */
          const current =
            section.href === "/admin" ? pathname === "/admin" : pathname.startsWith(section.href);

          return (
            <li key={section.href}>
              <Link
                href={section.href}
                // Announces the current section rather than leaving colour to
                // carry it alone.
                aria-current={current ? "page" : undefined}
                className={`block rounded px-3 py-2 text-sm whitespace-nowrap ${
                  current
                    ? "bg-foreground text-background"
                    : "text-muted hover:bg-foreground/5 hover:text-foreground"
                }`}
              >
                {labels[section.key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
