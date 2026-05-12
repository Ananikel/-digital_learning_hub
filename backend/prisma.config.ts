import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    // We provide a fallback dummy URL if process.env.DATABASE_URL is undefined
    // so that 'prisma generate' during Docker build doesn't crash.
    url: process.env["DATABASE_URL"] || "postgresql://dummy:dummy@localhost:5432/dummy",
  },
});
