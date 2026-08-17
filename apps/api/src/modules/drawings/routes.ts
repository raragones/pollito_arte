import { Hono } from "hono";
import type { Context } from "hono";
import { drawingInputSchema } from "@natyarte/shared";
import { AppError } from "../../lib/errors.js";
import type { AppEnv } from "../auth/auth.js";
import { drawingService } from "./drawing-service.js";
import { validateImage } from "./image-validation.js";
function parseMetadata(value: unknown) {
  if (typeof value !== "string")
    throw new AppError(400, "INVALID_METADATA", "Faltan los datos del dibujo.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new AppError(
      400,
      "INVALID_METADATA",
      "Los datos del dibujo no son JSON válido.",
    );
  }
  const result = drawingInputSchema.safeParse(parsed);
  if (!result.success)
    throw new AppError(
      400,
      "VALIDATION_ERROR",
      "Revisa los campos del dibujo.",
      result.error.flatten(),
    );
  return result.data;
}
function imageResponse(c: Context, image: { data: Buffer; mimeType: string }) {
  c.header("Content-Type", image.mimeType);
  c.header("Content-Length", String(image.data.length));
  c.header("Cache-Control", "public, max-age=86400");
  c.header("X-Content-Type-Options", "nosniff");
  return c.body(new Uint8Array(image.data));
}
export const publicDrawings = new Hono()
  .get("/", async (c) =>
    c.json(await drawingService.listPublic(c.req.query("collection"))),
  )
  .get("/featured", async (c) => c.json(await drawingService.getFeatured()))
  .post("/:id/like", async (c) =>
    c.json(await drawingService.like(c.req.param("id"))),
  )
  .get("/:id/recommendations", async (c) =>
    c.json(await drawingService.recommendations(c.req.param("id"))),
  )
  .get("/:id/image", async (c) =>
    imageResponse(c, await drawingService.getImage(c.req.param("id"))),
  )
  .get("/:slug", async (c) =>
    c.json(await drawingService.getPublic(c.req.param("slug"))),
  );
export const adminDrawings = new Hono<AppEnv>()
  .get("/", async (c) => c.json(await drawingService.listAdmin()))
  .get("/:id/image", async (c) =>
    imageResponse(c, await drawingService.getImage(c.req.param("id"), false)),
  )
  .post("/", async (c) => {
    const body = await c.req.parseBody();
    const input = parseMetadata(body.metadata);
    const image = await validateImage(body.image);
    return c.json(
      await drawingService.create(input, image, c.get("adminEmail")),
      201,
    );
  })
  .put("/:id", async (c) => {
    const body = await c.req.parseBody();
    const input = parseMetadata(body.metadata);
    const image =
      body.image instanceof File && body.image.size > 0
        ? await validateImage(body.image)
        : undefined;
    return c.json(await drawingService.update(c.req.param("id"), input, image));
  })
  .delete("/:id", async (c) => {
    await drawingService.delete(c.req.param("id"));
    return c.body(null, 204);
  });
