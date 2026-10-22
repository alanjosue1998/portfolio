import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

import prisma from "@/lib/prisma";

/**
 * Better Auth reads `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL` from the
 * environment on its own — see `.env`.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    /**
     * The portfolio has a single owner, so a reachable sign-up endpoint would
     * only ever be a way in for someone else. Accounts are created from the
     * terminal instead — see `npm run user:create`.
     */
    disableSignUp: true,
  },
  /**
   * Only requests through Better Auth's own router are counted — that is why
   * the login form posts to `/api/auth/sign-in/email` rather than calling
   * `auth.api.signInEmail` from a Server Action, which skips the limiter.
   *
   * In the database rather than in memory: on Vercel every serverless instance
   * has its own memory, so an in-memory count would reset whenever a request
   * landed on a fresh one. The client IP comes from `x-forwarded-for`, which
   * Vercel sets itself and does not pass through from the caller.
   *
   * On by default in production only, which is left as it is: locally every
   * request comes from the same address, and a typo would lock you out.
   */
  rateLimit: {
    storage: "database",
    customRules: {
      // One person logs in here. Ten tries in fifteen minutes is generous for
      // them and makes guessing a password from one address hopeless.
      "/sign-in/email": { window: 15 * 60, max: 10 },
    },
  },
  /**
   * Lets the cookies Better Auth sets during a Server Action reach the browser.
   * It has to stay last in the list.
   */
  plugins: [nextCookies()],
});
