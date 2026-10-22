import { createAuthClient } from "better-auth/client";

/**
 * Better Auth from the browser, talking to `/api/auth/*` on the same origin —
 * hence no `baseURL`. The vanilla client rather than `better-auth/react`: the
 * login form only needs `signIn`, not the session hooks.
 *
 * Signing in goes through here rather than through a Server Action because only
 * requests that reach Better Auth's router are rate-limited. See `lib/auth.ts`.
 */
export const authClient = createAuthClient();
