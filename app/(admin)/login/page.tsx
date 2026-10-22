import { redirect } from "next/navigation";

import { getAdminDictionary } from "@/lib/admin-i18n";
import { getSession } from "@/lib/session";

import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Nothing to log into if you already are.
  if (await getSession()) redirect("/admin");

  const dict = await getAdminDictionary();

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">{dict.login.title}</h1>
      <LoginForm t={dict.login} />
    </main>
  );
}
