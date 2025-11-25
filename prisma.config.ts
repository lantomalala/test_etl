import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: "postgresql://neondb_owner:npg_c5N7FHSqMVIb@ep-rough-haze-aeckutfe-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require",
  },
});
