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
   * Lets the cookies Better Auth sets during a Server Action reach the browser.
   * It has to stay last in the list.
   */
  plugins: [nextCookies()],
});
