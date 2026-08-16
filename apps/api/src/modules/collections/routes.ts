import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { asc, eq, sql } from "drizzle-orm";
import { collectionInputSchema } from "@natyarte/shared";
import { getDb } from "../../infrastructure/database/client.js";
import { collections, drawings } from "../../infrastructure/database/schema.js";
import { AppError } from "../../lib/errors.js";
const projection = {
  id: collections.id,
  name: collections.name,
  slug: collections.slug,
  description: collections.description,
  coverImageUrl: collections.coverImageUrl,
  order: collections.order,
  active: collections.active,
  createdAt: collections.createdAt,
  updatedAt: collections.updatedAt,
  drawingCount: sql<number>`count(${drawings.id})::int`,
};
export const publicCollections = new Hono().get("/", async (c) =>
  c.json(
    await getDb()
      .select(projection)
      .from(collections)
      .leftJoin(
        drawings,
        sql`${drawings.collectionId}=${collections.id} and ${drawings.published}=true`,
      )
      .where(eq(collections.active, true))
      .groupBy(collections.id)
      .orderBy(asc(collections.order), asc(collections.name)),
  ),
);
export const adminCollections = new Hono()
  .get("/", async (c) =>
    c.json(
      await getDb()
        .select(projection)
        .from(collections)
        .leftJoin(drawings, eq(drawings.collectionId, collections.id))
        .groupBy(collections.id)
        .orderBy(asc(collections.order)),
    ),
  )
  .post("/", zValidator("json", collectionInputSchema), async (c) => {
    const [v] = await getDb()
      .insert(collections)
      .values(c.req.valid("json"))
      .returning();
    return c.json(v, 201);
  })
  .put("/:id", zValidator("json", collectionInputSchema), async (c) => {
    const [v] = await getDb()
      .update(collections)
      .set({ ...c.req.valid("json"), updatedAt: new Date() })
      .where(eq(collections.id, c.req.param("id")))
      .returning();
    if (!v) throw new AppError(404, "NOT_FOUND", "Colección no encontrada.");
    return c.json(v);
  })
  .delete("/:id", async (c) => {
    const result = await getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(drawings)
      .where(eq(drawings.collectionId, c.req.param("id")));
    if ((result[0]?.count ?? 0) > 0)
      throw new AppError(
        409,
        "COLLECTION_NOT_EMPTY",
        "Desactiva la colección o reasigna sus dibujos antes de eliminarla.",
      );
    const [v] = await getDb()
      .delete(collections)
      .where(eq(collections.id, c.req.param("id")))
      .returning();
    if (!v) throw new AppError(404, "NOT_FOUND", "Colección no encontrada.");
    return c.body(null, 204);
  });
