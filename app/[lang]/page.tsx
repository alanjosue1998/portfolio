import About from "@/app/components/About";
import Contact from "@/app/components/Contact";
import Location from "@/app/components/Location";
import Projects from "@/app/components/Projects";
import SiteHeader from "@/app/components/SiteHeader";
import Skills from "@/app/components/Skills";
import { getDictionary } from "@/lib/dictionaries";

export default async function Home() {
  const dict = await getDictionary();

  /**
   * `max-w-7xl` stops the column from stretching the full width of a large
   * monitor, `mx-auto` centres what is left, and the padding keeps it off the
   * edge on a phone. Everything inside is fluid, so the one rule covers every
   * screen without a breakpoint of its own.
   */
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-10 sm:px-6">
      <SiteHeader />
      {/* The map opens the page, and carries the greeting and the portrait. */}
      <Location />
      <p>{dict.hero.tagline}</p>
      <About />
      {/* Each of these renders nothing until the admin has something to show. */}
      <Skills />
      <Projects />
      <Contact />
    </main>
  );
}
