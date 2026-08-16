import { imageSize } from "image-size";
import { AppError } from "../../lib/errors.js";
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
export interface ValidatedImage {
  data: Buffer;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
}
export async function validateImage(file: unknown): Promise<ValidatedImage> {
  if (!(file instanceof File))
    throw new AppError(400, "IMAGE_REQUIRED", "Debes seleccionar una imagen.");
  if (!ALLOWED_IMAGE_TYPES.has(file.type))
    throw new AppError(
      400,
      "INVALID_IMAGE_TYPE",
      "Solo se permiten imágenes JPEG, PNG o WebP.",
    );
  if (file.size <= 0 || file.size > MAX_IMAGE_SIZE_BYTES)
    throw new AppError(
      400,
      "IMAGE_TOO_LARGE",
      "La imagen debe pesar como máximo 5 MB.",
    );
  const data = Buffer.from(await file.arrayBuffer());
  try {
    const dimensions = imageSize(data);
    return {
      data,
      mimeType: file.type,
      size: file.size,
      width: dimensions.width ?? null,
      height: dimensions.height ?? null,
    };
  } catch {
    throw new AppError(
      400,
      "INVALID_IMAGE",
      "El archivo no contiene una imagen válida.",
    );
  }
}
