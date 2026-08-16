import { z } from "zod";

export const drawingStatuses = ["draft", "in_progress", "finished"] as const;
export const drawingStatusLabels = {
  draft: "Boceto",
  in_progress: "En progreso",
  finished: "Terminado",
} as const;

export const collectionInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(90)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500).optional().nullable(),
  coverImageUrl: z.string().url().optional().nullable(),
  order: z.number().int().min(0).default(0),
  active: z.boolean().default(true),
});

export const drawingInputSchema = z.object({
  title: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(1000).optional().nullable(),
  collectionId: z.string().uuid().optional().nullable(),
  status: z.enum(drawingStatuses).default("draft"),
  materials: z.string().trim().max(500).optional().nullable(),
  story: z.string().trim().max(3000).optional().nullable(),
  favoritePart: z.string().trim().max(1500).optional().nullable(),
  favorite: z.boolean().default(false),
  featured: z.boolean().default(false),
  published: z.boolean().default(false),
  drawingDate: z.string().date().optional().nullable(),
});

export type DrawingInput = z.infer<typeof drawingInputSchema>;
export type CollectionInput = z.infer<typeof collectionInputSchema>;
export interface Collection extends CollectionInput {
  id: string;
  createdAt: string;
  updatedAt: string;
  drawingCount?: number;
}
export interface Drawing extends DrawingInput {
  id: string;
  imageUrl: string;
  hasImage: boolean;
  createdAt: string;
  updatedAt: string;
  collection?: Pick<Collection, "id" | "name" | "slug"> | null;
}
export interface ApiError {
  error: { code: string; message: string; details?: unknown };
}
