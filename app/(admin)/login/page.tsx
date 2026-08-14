import { redirect } from "next/navigation";

import { getSession } from "@/lib/session";

import LoginForm from "./LoginForm";

export default async function LoginPage() {
  // Nothing to log into if you already are.
  if (await getSession()) redirect("/admin");

  return (
    <main className="mx-auto flex w-full max-w-sm flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Entrar al panel</h1>
      <LoginForm />
    </main>
  );
}
