import type { DrawingInput } from "@natyarte/shared";
import { eq } from "drizzle-orm";
import { db } from "../../infrastructure/database/client.js";
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
    const id = await db.transaction(async (tx) => {
      if (input.featured) await tx.update(drawings).set({ featured: false });
      const [drawing] = await tx
        .insert(drawings)
        .values({ ...input, createdBy: adminEmail })
        .returning({ id: drawings.id });
      if (!drawing)
        throw new AppError(500, "CREATE_FAILED", "No se pudo crear el dibujo.");
      await tx
        .insert(drawingImages)
        .values({ ...image, drawingId: drawing.id });
      return drawing.id;
    });
    return { id, imageUrl: `/api/admin/drawings/${id}/image` };
  },
  update: async (id: string, input: DrawingInput, image?: ValidatedImage) => {
    await db.transaction(async (tx) => {
      if (input.featured) await tx.update(drawings).set({ featured: false });
      const [drawing] = await tx
        .update(drawings)
        .set({ ...input, updatedAt: new Date() })
        .where(eq(drawings.id, id))
        .returning({ id: drawings.id });
      if (!drawing)
        throw new AppError(404, "NOT_FOUND", "Dibujo no encontrado.");
      if (image) {
        await tx.delete(drawingImages).where(eq(drawingImages.drawingId, id));
        await tx.insert(drawingImages).values({ ...image, drawingId: id });
      }
    });
    return { id, imageUrl: `/api/admin/drawings/${id}/image` };
  },
  delete: async (id: string) => {
    const [row] = await db
      .delete(drawings)
      .where(eq(drawings.id, id))
      .returning({ id: drawings.id });
    if (!row) throw new AppError(404, "NOT_FOUND", "Dibujo no encontrado.");
  },
};
