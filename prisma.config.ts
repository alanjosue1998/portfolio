// Prisma 7 no longer loads `.env` on its own, so `dotenv/config` has to run
// before DATABASE_URL is read. It must stay the first import.
import "dotenv/config";

import { defineConfig } from "prisma/config";

// `env("DATABASE_URL")` throws as soon as this file is loaded when the variable
// is missing, which breaks `prisma generate` in the `postinstall` hook on hosts
// that don't expose the database URL at install time. Only `migrate`,
// `db push`, `studio` and `db pull` need a datasource, so it is left out when
// the variable is absent — those commands then fail with their own message
// instead of taking the whole install down with them.
//
// The CLI also needs a direct connection, not a pooled one. `migrate deploy`
// holds a Postgres advisory lock for the whole run, and a transaction-mode
// pooler such as Neon's hands each statement to whichever server connection is
// free, so the lock never settles and the run times out with P1002. The app
// itself keeps the pooled `DATABASE_URL` — see `lib/prisma.ts` — since that is
// what serverless functions need; only the CLI goes direct.
//
// Neon's Vercel integration sets the direct URL as `DATABASE_URL_UNPOOLED`.
// Without it, a Neon pooled host is turned into its direct one by dropping the
// `-pooler` suffix, which is how Neon names the two; any other URL is used as
// it is.
function directUrl(): string | undefined {
  const explicit = process.env.DATABASE_URL_UNPOOLED ?? process.env.DIRECT_URL;
  if (explicit) return explicit;

  const pooled = process.env.DATABASE_URL;
  if (!pooled) return undefined;

  try {
    const url = new URL(pooled);
    if (url.hostname.endsWith(".neon.tech")) {
      url.hostname = url.hostname.replace(/-pooler(?=\.)/, "");
    }
    return url.toString();
  } catch {
    return pooled;
  }
}

const databaseUrl = directUrl();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
