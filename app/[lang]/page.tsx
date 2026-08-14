import About from "@/app/components/About";
import Location from "@/app/components/Location";
import SiteHeader from "@/app/components/SiteHeader";
import { getDictionary } from "@/lib/dictionaries";

export default async function Home() {
  const dict = await getDictionary();

  /**
   * `max-w-3xl` stops the column from stretching the full width of a large
   * monitor, `mx-auto` centres what is left, and the padding keeps it off the
   * edge on a phone. Everything inside is fluid, so the one rule covers every
   * screen without a breakpoint of its own.
   */
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6">
      <SiteHeader />
      <h1>{dict.hero.greeting}</h1>
      <p>{dict.hero.tagline}</p>
      <About />
      <Location />
    </main>
  );
}
