import { z } from "zod";
const schema = z.object({
  DATABASE_URL: z.string().url(),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  API_PORT: z.coerce.number().default(8787),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  ADMIN_EMAILS: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
});

export interface WorkerBindings {
  DATABASE_URL: string;
  WEB_ORIGIN: string;
  API_PORT?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET?: string;
  ADMIN_EMAILS: string;
  SESSION_SECRET: string;
}

export function loadWorkerBindings(bindings: WorkerBindings) {
  for (const [key, value] of Object.entries(bindings)) {
    if (typeof value === "string") process.env[key] = value;
  }
}

export function getEnv() {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success)
    throw new Error(`Invalid environment: ${parsed.error.message}`);
  return {
    ...parsed.data,
    adminEmails: new Set(
      parsed.data.ADMIN_EMAILS.split(",")
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean),
    ),
  };
}
