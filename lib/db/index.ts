import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import * as schema from "./schema";
import path from "path";

// Use /app/data in production (Docker), current directory in development
const dbPath =
  process.env.NODE_ENV === "production"
    ? path.join(process.env.APP_DATA_DIR ?? "/app/data", "sqlite.db")
    : "sqlite.db";

const sqlite = new Database(dbPath);

export const db = drizzle(sqlite, { schema });
