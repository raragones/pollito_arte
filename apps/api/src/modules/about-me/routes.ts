import { Hono } from "hono";
import type { Context } from "hono";
import { zValidator } from "@hono/zod-validator";
import { aboutMeInputSchema } from "@natyarte/shared";
import type { AppEnv } from "../auth/auth.js";
import { validateImage } from "../drawings/image-validation.js";
import { aboutMeService } from "./about-me-service.js";

function imageResponse(c: Context, image: { data: Buffer; mimeType: string }) {
  c.header("Content-Type", image.mimeType);
  c.header("Content-Length", String(image.data.length));
  c.header("Cache-Control", "public, max-age=3600");
  c.header("X-Content-Type-Options", "nosniff");
  return c.body(new Uint8Array(image.data));
}

export const publicAboutMe = new Hono()
  .get("/", async (c) => c.json(await aboutMeService.get()))
  .get("/image", async (c) =>
    imageResponse(c, await aboutMeService.getImage()),
  );

export const adminAboutMe = new Hono<AppEnv>()
  .get("/", async (c) => c.json(await aboutMeService.get()))
  .put("/", zValidator("json", aboutMeInputSchema), async (c) =>
    c.json(await aboutMeService.save(c.req.valid("json"))),
  )
  .put("/image", async (c) => {
    const body = await c.req.parseBody();
    await aboutMeService.saveImage(await validateImage(body.image));
    return c.body(null, 204);
  })
  .delete("/image", async (c) => {
    await aboutMeService.deleteImage();
    return c.body(null, 204);
  });
