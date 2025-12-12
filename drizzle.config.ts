import { defineConfig } from "drizzle-kit";
import path from "path";

const dbPath =
  process.env.NODE_ENV === "production"
    ? path.join(process.env.APP_DATA_DIR ?? "/app/data", "sqlite.db")
    : "sqlite.db";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: dbPath,
  },
});
