import { getDictionary } from "@/lib/dictionaries";

export default async function About() {
  const dict = await getDictionary();

  return (
    <section>
      <h2>{dict.about.heading}</h2>
      <p>{dict.about.body}</p>
    </section>
  );
}
