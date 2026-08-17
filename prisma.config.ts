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
const databaseUrl = process.env.DATABASE_URL;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(databaseUrl ? { datasource: { url: databaseUrl } } : {}),
});
