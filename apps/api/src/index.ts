import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { env } from "./config/env.js";
serve({ fetch: app.fetch, port: env.API_PORT }, (info) =>
  console.log(`NatyArte API en http://localhost:${info.port}`),
);
