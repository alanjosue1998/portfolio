"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  /**
   * Posts to `/api/auth/sign-in/email` through the auth client instead of a
   * Server Action, so the attempt is counted by Better Auth's rate limiter —
   * a Server Action calling `auth.api.signInEmail` skips it. The fields stay
   * uncontrolled and are not reset, so a typo only costs retyping the password.
   */
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const form = new FormData(event.currentTarget);
    const { error } = await authClient.signIn.email({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });

    if (error) {
      setPending(false);
      setError(
        error.status === 429
          ? "Demasiados intentos. Espera unos minutos antes de volver a probar."
          : /**
             * One message for a wrong password and for an email that has no
             * account. Telling them apart would let anyone check which emails
             * are registered.
             */
            "Email o contraseña incorrectos.",
      );
      return;
    }

    // The session cookie is already set, and the admin's layout reads it on the
    // server for this navigation. `pending` stays on until the page lands.
    router.replace("/admin");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className="rounded border border-gray-400 px-3 py-2"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="rounded border border-gray-400 px-3 py-2"
        />
      </div>

      {/* `role="alert"` makes a screen reader announce the failure. */}
      {error && (
        <p role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-60"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
