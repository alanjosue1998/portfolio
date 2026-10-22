import About from "@/app/components/About";
import Certificates from "@/app/components/Certificates";
import Contact from "@/app/components/Contact";
import ContactCta from "@/app/components/ContactCta";
import Footer from "@/app/components/Footer";
import Location from "@/app/components/Location";
import Projects from "@/app/components/Projects";
import Skills from "@/app/components/Skills";
import { getDictionary } from "@/lib/dictionaries";

export default async function Home() {
  const dict = await getDictionary();

  /**
   * `max-w-3xl` — 768px — rather than the 1280px this used to run to. At the
   * old width the About paragraph came out at 161 characters a line, against
   * the 45-to-75 that reading comfortably asks for, and the page felt as wide
   * as it measured. `mx-auto` centres what is left and the padding keeps it off
   * the edge on a phone; everything inside is fluid, so the one rule covers
   * every screen without a breakpoint of its own.
   *
   * A narrower column is most of the fix and not all of it: prose here still
   * runs to roughly 94 characters, which a `max-w-xl` on the paragraphs
   * themselves would bring inside the range. That is a deliberate stop — one
   * width for the whole page keeps the map, the cards and the text on the same
   * edges, and two would not.
   *
   * Not padded at the top. The map is the first thing here and it is meant to
   * meet the top of the window: a strip of page above it made it look like a
   * card that had been placed on the page rather than the thing the page opens
   * with.
   *
   * `gap-16` between sections, up from 10: at 40px a section title sat almost
   * as close to the cards above it as to its own, and the page read as one
   * long list. The opening block keeps its own tighter rhythm inside.
   *
   * `[counter-reset:section]` starts the numbers `SectionHeading` draws.
   */
  return (
    <>
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-12 px-4 [counter-reset:section] sm:gap-16 sm:px-6">
        <div className="flex flex-col gap-6">
          {/* The map opens the page, and carries the greeting and the portrait. */}
          <Location />
          <p className="max-w-[34ch] text-lg leading-snug text-balance sm:text-xl">
            {dict.hero.role} · <span className="font-medium text-accent">{dict.hero.tagline}</span>
          </p>
          {/* The calls to action above the fold. Renders nothing until an
              email link exists in the admin. */}
          <ContactCta />
        </div>
        <About />
        {/* Each of these renders nothing until the admin has something to show. */}
        <Skills />
        <Projects />
        <Certificates />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
