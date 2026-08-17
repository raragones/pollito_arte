import type { AboutMeInput } from "@natyarte/shared";
import { AppError } from "../../lib/errors.js";
import type { ValidatedImage } from "../drawings/image-validation.js";
import { aboutMeRepository } from "./about-me-repository.js";

const dto = (
  row: NonNullable<Awaited<ReturnType<typeof aboutMeRepository.get>>>,
) => ({
  shortTitle: row.shortTitle,
  shortDescription: row.shortDescription,
  fullTitle: row.fullTitle,
  subtitle: row.subtitle,
  content: row.content,
  updatedAt: row.updatedAt,
  imageUrl: row.hasImage ? "/api/about-me/image" : null,
});

export const aboutMeService = {
  get: async () => {
    const row = await aboutMeRepository.get();
    if (!row)
      throw new AppError(
        404,
        "NOT_FOUND",
        "La sección Sobre mí aún no está disponible.",
      );
    return dto(row);
  },
  save: async (input: AboutMeInput) => {
    await aboutMeRepository.save(input);
    return dto((await aboutMeRepository.get())!);
  },
  getImage: async () => {
    const image = await aboutMeRepository.getImage();
    if (!image)
      throw new AppError(404, "IMAGE_NOT_FOUND", "Imagen no encontrada.");
    return image;
  },
  saveImage: async (image: ValidatedImage) => {
    await aboutMeRepository.saveImage(image);
  },
  deleteImage: () => aboutMeRepository.deleteImage(),
};
