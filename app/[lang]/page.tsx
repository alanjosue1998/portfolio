import About from "@/app/components/About";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { getDictionary } from "@/lib/dictionaries";

export default async function Home() {
  const dict = await getDictionary();

  return (
    <main>
      <LanguageSwitcher />
      <h1>{dict.hero.greeting}</h1>
      <p>{dict.hero.tagline}</p>
      <About />
    </main>
  );
}
