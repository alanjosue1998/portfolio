/**
 * Read straight off disk rather than through `getDictionary`, which reads the
 * locale from the `[lang]` root segment — and the panel is the other root, so
 * there is no locale there to read. Only the fallback paragraphs are wanted
 * anyway, to show under each field.
 */
import en from "@/dictionaries/en.json";
import es from "@/dictionaries/es.json";
import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/session";

import AboutForm from "./AboutForm";
import ContactLinkForm from "./ContactLinkForm";
import ProfileForm from "./ProfileForm";
import { deleteContactLink } from "./actions";

export default async function ProfilePage() {
  // Redirects to /login when there is no valid session.
  await requireSession();

  const [contactLinks, profile] = await Promise.all([
    prisma.contactLink.findMany({ orderBy: [{ position: "asc" }, { createdAt: "asc" }] }),
    prisma.profile.findUnique({ where: { id: "main" } }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Foto de perfil</h2>
        <ProfileForm imageUrl={profile?.imageUrl ?? null} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Sobre mí</h2>
        <AboutForm
          current={{ es: profile?.aboutEs ?? null, en: profile?.aboutEn ?? null }}
          fallback={{ es: es.about.body, en: en.about.body }}
        />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Contactos ({contactLinks.length})</h2>

        <ContactLinkForm />

        {contactLinks.length > 0 && (
          <ul className="flex flex-col gap-2">
            {contactLinks.map((link) => (
              <li
                key={link.id}
                className="flex items-center justify-between gap-4 rounded border border-gray-300 p-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {link.label}{" "}
                    <span className="font-normal text-gray-500">({link.platform})</span>
                  </p>
                  {/* `truncate` keeps a long URL from stretching the row. */}
                  <p className="truncate text-sm text-gray-500">{link.url}</p>
                </div>

                <form action={deleteContactLink}>
                  <input type="hidden" name="id" value={link.id} />
                  <button type="submit" className="text-sm text-red-600 underline">
                    Borrar
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
