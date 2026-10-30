"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { AdminDictionary } from "@/lib/admin-i18n";
import { authClient } from "@/lib/auth-client";

import { FIELD } from "../admin/form-ui";

export default function LoginForm({ t }: { t: AdminDictionary["login"] }) {
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
          ? t.tooMany
          : /**
             * One message for a wrong password and for an email that has no
             * account. Telling them apart would let anyone check which emails
             * are registered.
             */
            t.invalid,
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
        <label htmlFor="email">{t.email}</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={FIELD}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password">{t.password}</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </div>

      {/* `role="alert"` makes a screen reader announce the failure. */}
      {error && (
        <p role="alert" className="text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-accent px-5 font-medium text-on-accent hover:bg-accent-strong disabled:opacity-60"
      >
        {pending ? t.submitting : t.submit}
      </button>
    </form>
  );
}
