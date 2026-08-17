import type { DrawingInput } from "@natyarte/shared";
import { eq } from "drizzle-orm";
import { getDb } from "../../infrastructure/database/client.js";
import {
  drawingImages,
  drawings,
} from "../../infrastructure/database/schema.js";
import { AppError } from "../../lib/errors.js";
import { drawingRepository } from "./drawing-repository.js";
import type { ValidatedImage } from "./image-validation.js";
export const DAILY_DRAWING_LIMIT = 10;
const dto = <T extends { id: string; hasImage: boolean }>(
  drawing: T,
  admin = false,
) => ({
  ...drawing,
  imageUrl: `/api/${admin ? "admin/" : ""}drawings/${drawing.id}/image`,
});
const todayRange = () => {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
};
export const drawingService = {
  listPublic: async (collection?: string) =>
    (await drawingRepository.listPublic(collection)).map((row) => dto(row)),
  listAdmin: async () =>
    (await drawingRepository.listAdmin()).map((row) => dto(row, true)),
  getPublic: async (slug: string) => {
    const row = await drawingRepository.findPublicBySlug(slug);
    if (!row) throw new AppError(404, "NOT_FOUND", "Dibujo no encontrado.");
    return dto(row);
  },
  getFeatured: async () => {
    const row = await drawingRepository.findFeatured();
    if (!row)
      throw new AppError(404, "NOT_FOUND", "Aún no hay un dibujo destacado.");
    return dto(row);
  },
  like: async (id: string) => {
    const row = await drawingRepository.incrementLike(id);
    if (!row) throw new AppError(404, "NOT_FOUND", "Dibujo no encontrado.");
    return row;
  },
  recommendations: async (id: string) => {
    const rows = await drawingRepository.listPublic();
    const current = rows.find((row) => row.id === id);
    if (!current) throw new AppError(404, "NOT_FOUND", "Dibujo no encontrado.");
    return rows
      .filter((row) => row.id !== id)
      .sort((a, b) => {
        const aSame =
          current.collectionId && a.collectionId === current.collectionId
            ? 1
            : 0;
        const bSame =
          current.collectionId && b.collectionId === current.collectionId
            ? 1
            : 0;
        return bSame - aSame;
      })
      .slice(0, 3)
      .map((row) => dto(row));
  },
  getImage: async (id: string, publishedOnly = true) => {
    const image = await drawingRepository.findImage(id, publishedOnly);
    if (!image)
      throw new AppError(404, "IMAGE_NOT_FOUND", "Imagen no encontrada.");
    return image;
  },
  create: async (
    input: DrawingInput,
    image: ValidatedImage,
    adminEmail: string,
  ) => {
    const db = getDb();
    const { start, end } = todayRange();
    if (
      (await drawingRepository.countCreatedBy(adminEmail, start, end)) >=
      DAILY_DRAWING_LIMIT
    )
      throw new AppError(
        429,
        "DAILY_UPLOAD_LIMIT_REACHED",
        `Alcanzaste el máximo de ${DAILY_DRAWING_LIMIT} dibujos por hoy.`,
      );
    const id = crypto.randomUUID();
    const createDrawing = db
      .insert(drawings)
      .values({ id, ...input, createdBy: adminEmail });
    const createImage = db
      .insert(drawingImages)
      .values({ ...image, drawingId: id });
    if (input.featured) {
      await db.batch([
        db.update(drawings).set({ featured: false }),
        createDrawing,
        createImage,
      ]);
    } else {
      await db.batch([createDrawing, createImage]);
    }
    return { id, imageUrl: `/api/admin/drawings/${id}/image` };
  },
  update: async (id: string, input: DrawingInput, image?: ValidatedImage) => {
    const db = getDb();
    const [existing] = await db
      .select({ id: drawings.id })
      .from(drawings)
      .where(eq(drawings.id, id))
      .limit(1);
    if (!existing)
      throw new AppError(404, "NOT_FOUND", "Dibujo no encontrado.");
    const updateDrawing = db
      .update(drawings)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(drawings.id, id));
    const resetFeatured = db.update(drawings).set({ featured: false });
    if (image && input.featured) {
      await db.batch([
        resetFeatured,
        updateDrawing,
        db.delete(drawingImages).where(eq(drawingImages.drawingId, id)),
        db.insert(drawingImages).values({ ...image, drawingId: id }),
      ]);
    } else if (image) {
      await db.batch([
        updateDrawing,
        db.delete(drawingImages).where(eq(drawingImages.drawingId, id)),
        db.insert(drawingImages).values({ ...image, drawingId: id }),
      ]);
    } else if (input.featured) {
      await db.batch([resetFeatured, updateDrawing]);
    } else {
      await updateDrawing;
    }
    return { id, imageUrl: `/api/admin/drawings/${id}/image` };
  },
  delete: async (id: string) => {
    const db = getDb();
    const [row] = await db
      .delete(drawings)
      .where(eq(drawings.id, id))
      .returning({ id: drawings.id });
    if (!row) throw new AppError(404, "NOT_FOUND", "Dibujo no encontrado.");
  },
};
