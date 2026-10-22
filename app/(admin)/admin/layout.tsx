import { getAdminDictionary } from "@/lib/admin-i18n";
import { requireSession } from "@/lib/session";

import AdminNav from "./AdminNav";
import { signOut } from "./actions";

/**
 * The chrome every admin section shares: who is signed in, the way out, and
 * the section nav. Splitting the panel across routes is what keeps each screen
 * to one job — the whole thing used to be a single page with every form on it.
 *
 * `requireSession` runs here and again in each page. That is not a duplicated
 * query: `getSession` is wrapped in React's `cache`, so the render pass hits
 * the database once. It is repeated because a layout is not a security
 * boundary — a page must not depend on its parent having checked.
 */
export default async function AdminSectionLayout({ children }: { children: React.ReactNode }) {
  const [session, dict] = await Promise.all([requireSession(), getAdminDictionary()]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 p-6 sm:p-8">
      <header className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border pb-4">
        <h1 className="text-2xl font-semibold">{dict.layout.title}</h1>

        <form action={signOut}>
          <span className="mr-3 text-sm text-muted">{session.user.email}</span>
          <button type="submit" className="text-sm underline">
            {dict.layout.signOut}
          </button>
        </form>
      </header>

      {/* Stacks on a phone, where a fixed side column would leave no room. */}
      <div className="flex flex-col gap-8 sm:flex-row sm:gap-10">
        <AdminNav label={dict.layout.navLabel} labels={dict.layout.nav} />
        {/* `min-w-0` lets long URLs truncate instead of stretching the column. */}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
