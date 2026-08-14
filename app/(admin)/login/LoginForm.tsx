"use client";

import { useActionState } from "react";

import { signIn, type LoginState } from "./actions";

const initialState: LoginState = undefined;

export default function LoginForm() {
  const [state, action, pending] = useActionState(signIn, initialState);

  return (
    <form action={action} className="flex flex-col gap-4">
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
      {state?.error && (
        <p role="alert" className="text-red-600">
          {state.error}
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
