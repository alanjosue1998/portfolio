"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

export type LoginState = { error: string } | undefined;

export async function signIn(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Escribe tu email y tu contraseña." };
  }

  try {
    await auth.api.signInEmail({
      body: { email, password },
      // Better Auth reads the request here and writes the session cookie back
      // through the `nextCookies` plugin configured in `lib/auth.ts`.
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      /**
       * One message for a wrong password and for an email that has no account.
       * Telling them apart would let anyone check which emails are registered.
       */
      return { error: "Email o contraseña incorrectos." };
    }

    throw error;
  }

  redirect("/admin");
}
