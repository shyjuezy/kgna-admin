import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/lib/db/schema";

export const isDatabaseConfigured = Boolean(process.env.DATABASE_URL);

let instance: ReturnType<typeof drizzle> | null = null;

function createClient() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  const sql = neon(process.env.DATABASE_URL);
  return drizzle(sql, { schema });
}

export function getDb() {
  if (!instance) {
    instance = createClient();
  }

  if (!instance) {
    throw new Error("DATABASE_URL is not configured");
  }

  return instance;
}
