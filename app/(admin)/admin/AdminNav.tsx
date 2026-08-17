"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const sections = [
  { href: "/admin", label: "Información de perfil" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/projects", label: "Proyectos" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Secciones" className="sm:w-56 sm:shrink-0">
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
                  current ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
