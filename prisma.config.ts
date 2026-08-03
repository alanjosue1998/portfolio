// Prisma 7 no longer loads `.env` on its own, so `dotenv/config` has to run
// before `env()` reads DATABASE_URL. It must stay the first import.
import "dotenv/config";

import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
