import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "@/lib/auth";

/**
 * The single place the admin area asks "who is this request from?". `cache`
 * keeps a render pass that checks the session in several components from
 * hitting the database once per component.
 */
export const getSession = cache(async () => auth.api.getSession({ headers: await headers() }));

/**
 * Every page and Server Action under `/admin` starts with this. The check in
 * `proxy.ts` only reads the cookie and can be spoofed; this one verifies the
 * session against the database, so it is the one that actually guards the data.
 */
export async function requireSession() {
  const session = await getSession();

  if (!session) redirect("/login");

  return session;
}
