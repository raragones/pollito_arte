import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { getEnv } from "../../config/env.js";
import * as schema from "./schema.js";

export function getDb() {
  return drizzle(neon(getEnv().DATABASE_URL), { schema });
}
