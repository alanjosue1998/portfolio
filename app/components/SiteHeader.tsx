import { getDictionary } from "@/lib/dictionaries";

import LanguageSwitcher from "./LanguageSwitcher";
import Menu from "./Menu";

/**
 * Reads the translations on the server and hands them to the menu, which is a
 * Client Component and so cannot call `getDictionary` itself. The language
 * switcher stays a Server Component and travels in as children.
 */
export default async function SiteHeader() {
  const dict = await getDictionary();

  return (
    <header className="flex justify-end">
      <Menu labels={dict.menu}>
        <LanguageSwitcher />
      </Menu>
    </header>
  );
}
