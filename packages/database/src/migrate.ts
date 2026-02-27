import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { db } from './index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env pour utiliser la MÊME base que le backend (ordre : package → racine → backend)
dotenv.config();
dotenv.config({ path: resolve(__dirname, '../../.env') });
dotenv.config({ path: resolve(__dirname, '../../apps/backend/.env') });

/**
 * Run migrations
 * This script applies all pending migrations to the database
 */
async function runMigrations() {
  try {
    console.log('🔄 Running migrations...');
    const migrationsFolder = resolve(__dirname, './migrations');
    await migrate(db, { migrationsFolder });
    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

