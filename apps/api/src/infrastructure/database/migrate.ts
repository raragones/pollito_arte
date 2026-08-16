import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL no está configurada en apps/api/.env');
}

const database = drizzle(neon(databaseUrl));

await migrate(database, { migrationsFolder: './drizzle' });
console.log('Migraciones aplicadas correctamente.');
