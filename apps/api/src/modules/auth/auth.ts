import { createHash, randomBytes } from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import { and, eq, gt } from "drizzle-orm";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import type { Context, MiddlewareHandler } from "hono";
import { getDb } from "../../infrastructure/database/client.js";
import { adminSessions } from "../../infrastructure/database/schema.js";
import { getEnv } from "../../config/env.js";
import { AppError } from "../../lib/errors.js";
export type AppEnv = { Variables: { adminEmail: string } };
const COOKIE = "natyarte_session";
const hash = (v: string) => createHash("sha256").update(v).digest("hex");
export async function loginWithGoogle(c: Context, credential: string) {
  const env = getEnv();
  const db = getDb();
  const google = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  const ticket = await google.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const email = ticket.getPayload()?.email?.toLowerCase();
  if (!email || !env.adminEmails.has(email))
    throw new AppError(403, "FORBIDDEN", "Esta cuenta no está autorizada.");
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 864e5);
  const isHttps = new URL(c.req.url).protocol === "https:";
  await db
    .insert(adminSessions)
    .values({ email, tokenHash: hash(token), expiresAt });
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    secure: isHttps,
    sameSite: isHttps ? "None" : "Lax",
    path: "/",
    expires: expiresAt,
  });
  return { email };
}
export const requireAdmin: MiddlewareHandler = async (c, next) => {
  const db = getDb();
  const token = getCookie(c, COOKIE);
  if (!token)
    throw new AppError(401, "UNAUTHORIZED", "Inicia sesión para continuar.");
  const [session] = await db
    .select()
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.tokenHash, hash(token)),
        gt(adminSessions.expiresAt, new Date()),
      ),
    )
    .limit(1);
  if (!session) throw new AppError(401, "UNAUTHORIZED", "La sesión expiró.");
  c.set("adminEmail", session.email);
  await next();
};
export async function logout(c: Context) {
  const db = getDb();
  const token = getCookie(c, COOKIE);
  if (token)
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.tokenHash, hash(token)));
  deleteCookie(c, COOKIE, { path: "/" });
}
