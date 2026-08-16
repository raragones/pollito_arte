import { and, desc, eq, gte, lt, sql } from "drizzle-orm";
import type { DrawingInput } from "@natyarte/shared";
import { getDb } from "../../infrastructure/database/client.js";
import {
  collections,
  drawingImages,
  drawings,
} from "../../infrastructure/database/schema.js";
export const drawingProjection = {
  id: drawings.id,
  title: drawings.title,
  slug: drawings.slug,
  description: drawings.description,
  collectionId: drawings.collectionId,
  status: drawings.status,
  materials: drawings.materials,
  story: drawings.story,
  favoritePart: drawings.favoritePart,
  favorite: drawings.favorite,
  featured: drawings.featured,
  published: drawings.published,
  drawingDate: drawings.drawingDate,
  createdAt: drawings.createdAt,
  updatedAt: drawings.updatedAt,
  hasImage: sql<boolean>`exists(select 1 from ${drawingImages} where ${drawingImages.drawingId}=${drawings.id})`,
  collection: sql`case when ${collections.id} is null then null else json_build_object('id',${collections.id},'name',${collections.name},'slug',${collections.slug}) end`,
};
export type DrawingRecord = typeof drawings.$inferSelect;
export type ImageRecord = typeof drawingImages.$inferSelect;
export const drawingRepository = {
  listPublic: async (collection?: string) =>
    getDb()
      .select(drawingProjection)
      .from(drawings)
      .leftJoin(collections, eq(drawings.collectionId, collections.id))
      .where(
        collection
          ? and(eq(drawings.published, true), eq(collections.slug, collection))
          : eq(drawings.published, true),
      )
      .orderBy(desc(drawings.drawingDate), desc(drawings.createdAt)),
  listAdmin: async () =>
    getDb()
      .select(drawingProjection)
      .from(drawings)
      .leftJoin(collections, eq(drawings.collectionId, collections.id))
      .orderBy(desc(drawings.createdAt)),
  findPublicBySlug: async (slug: string) => {
    const [row] = await getDb()
      .select(drawingProjection)
      .from(drawings)
      .leftJoin(collections, eq(drawings.collectionId, collections.id))
      .where(and(eq(drawings.slug, slug), eq(drawings.published, true)))
      .limit(1);
    return row;
  },
  findFeatured: async () => {
    const [row] = await getDb()
      .select(drawingProjection)
      .from(drawings)
      .leftJoin(collections, eq(drawings.collectionId, collections.id))
      .where(and(eq(drawings.published, true), eq(drawings.featured, true)))
      .orderBy(desc(drawings.updatedAt))
      .limit(1);
    return row;
  },
  findImage: async (id: string, publishedOnly = true) => {
    const [row] = await getDb()
      .select({ data: drawingImages.data, mimeType: drawingImages.mimeType })
      .from(drawingImages)
      .innerJoin(drawings, eq(drawingImages.drawingId, drawings.id))
      .where(
        publishedOnly
          ? and(eq(drawings.id, id), eq(drawings.published, true))
          : eq(drawings.id, id),
      )
      .limit(1);
    return row;
  },
  countCreatedBy: async (email: string, start: Date, end: Date) => {
    const [row] = await getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(drawings)
      .where(
        and(
          eq(drawings.createdBy, email),
          gte(drawings.createdAt, start),
          lt(drawings.createdAt, end),
        ),
      );
    return row?.count ?? 0;
  },
  toValues: (input: DrawingInput) => input,
};
