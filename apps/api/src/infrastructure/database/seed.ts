import { db } from "./client.js";
import { collections } from "./schema.js";
const names = [
  "Dragon Ball",
  "One Piece",
  "Naruto",
  "Murder Drones",
  "KPop Demon Hunters",
  "Sonic",
  "Paw Patrol",
  "Cómo entrenar a tu dragón",
];
const slug = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
await db
  .insert(collections)
  .values(
    names.map((name, order) => ({
      name,
      slug: slug(name),
      order,
      description: `Mis dibujos inspirados en ${name}.`,
    })),
  )
  .onConflictDoNothing();
console.log("Colecciones iniciales creadas.");
