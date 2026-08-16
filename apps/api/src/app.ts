import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { getEnv } from "./config/env.js";
import { errorHandler } from "./middlewares/error-handler.js";
import { loginWithGoogle, logout, requireAdmin } from "./modules/auth/auth.js";
import {
  publicCollections,
  adminCollections,
} from "./modules/collections/routes.js";
import { publicDrawings, adminDrawings } from "./modules/drawings/routes.js";
export const app = new Hono();
app.use(
  "*",
  secureHeaders({
    crossOriginResourcePolicy: "cross-origin",
  }),
);
app.use(
  "/api/*",
  cors({
    origin: (origin) => (origin === getEnv().WEB_ORIGIN ? origin : null),
    credentials: true,
    allowHeaders: ["Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);
app.onError(errorHandler);
app.get("/health", (c) => c.json({ status: "ok" }));
app.route("/api/collections", publicCollections);
app.route("/api/drawings", publicDrawings);
app.post("/api/auth/google", async (c) => {
  const { credential } = await c.req.json<{ credential?: string }>();
  if (!credential)
    return c.json(
      {
        error: {
          code: "INVALID_TOKEN",
          message: "Falta la credencial de Google.",
        },
      },
      400,
    );
  return c.json(await loginWithGoogle(c, credential));
});
app.post("/api/auth/logout", async (c) => {
  await logout(c);
  return c.body(null, 204);
});
app.get("/api/auth/me", requireAdmin, (c) => c.json({ authenticated: true }));
app.use("/api/admin/*", requireAdmin);
app.route("/api/admin/collections", adminCollections);
app.route("/api/admin/drawings", adminDrawings);
