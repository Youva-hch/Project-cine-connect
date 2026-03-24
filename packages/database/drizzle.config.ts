import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '../../.env' });
dotenv.config({ path: '../../apps/backend/.env' });

// Environment variables are loaded from .env file in the root
// Make sure to set them before running drizzle-kit commands

export default defineConfig({
  schema: './src/schema.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_NAME || 'cineconnect_dev',
    ssl: false, // Désactiver SSL pour les connexions locales
  },
});


