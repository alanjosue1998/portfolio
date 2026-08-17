import { getDictionary } from "@/lib/dictionaries";

export default async function About() {
  const dict = await getDictionary();

  return (
    /**
     * The portrait on the map links here. `scroll-mt-8` keeps the heading from
     * landing flush against the top of the viewport once the scroll finishes.
     */
    <section id="about" className="scroll-mt-8">
      <h2>{dict.about.heading}</h2>
      <p>{dict.about.body}</p>
    </section>
  );
}
