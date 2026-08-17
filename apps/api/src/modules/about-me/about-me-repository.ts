import { eq, sql } from "drizzle-orm";
import type { AboutMeInput } from "@natyarte/shared";
import { getDb } from "../../infrastructure/database/client.js";
import { aboutMe, aboutMeImage } from "../../infrastructure/database/schema.js";
import type { ValidatedImage } from "../drawings/image-validation.js";

const SINGLETON_ID = 1;

export const aboutMeRepository = {
  get: async () => {
    const [row] = await getDb()
      .select({
        shortTitle: aboutMe.shortTitle,
        shortDescription: aboutMe.shortDescription,
        fullTitle: aboutMe.fullTitle,
        subtitle: aboutMe.subtitle,
        content: aboutMe.content,
        updatedAt: aboutMe.updatedAt,
        hasImage: sql<boolean>`exists(select 1 from ${aboutMeImage} where ${aboutMeImage.aboutMeId} = ${aboutMe.id})`,
      })
      .from(aboutMe)
      .where(eq(aboutMe.id, SINGLETON_ID))
      .limit(1);
    return row;
  },
  save: async (input: AboutMeInput) => {
    const [row] = await getDb()
      .insert(aboutMe)
      .values({ id: SINGLETON_ID, ...input, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: aboutMe.id,
        set: { ...input, updatedAt: new Date() },
      })
      .returning();
    return row;
  },
  getImage: async () => {
    const [row] = await getDb()
      .select({ data: aboutMeImage.data, mimeType: aboutMeImage.mimeType })
      .from(aboutMeImage)
      .where(eq(aboutMeImage.aboutMeId, SINGLETON_ID))
      .limit(1);
    return row;
  },
  saveImage: async (image: ValidatedImage) => {
    await getDb()
      .insert(aboutMeImage)
      .values({ aboutMeId: SINGLETON_ID, ...image })
      .onConflictDoUpdate({
        target: aboutMeImage.aboutMeId,
        set: { ...image, updatedAt: new Date() },
      });
  },
  deleteImage: async () =>
    getDb()
      .delete(aboutMeImage)
      .where(eq(aboutMeImage.aboutMeId, SINGLETON_ID)),
};
