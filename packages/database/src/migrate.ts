import dotenv from 'dotenv';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Run migrations
 * This script applies all pending migrations to the database
 */
async function runMigrations() {
  try {
    // En Upsun, on utilise PLATFORM_RELATIONSHIPS pour construire l'URL DB.
    // Ne recharge pas les .env locaux (sinon DATABASE_URL serait réécrit avec localhost).
    const hasPlatformRelationships = Boolean(process.env.PLATFORM_RELATIONSHIPS);
    if (!hasPlatformRelationships) {
      // Charger .env pour utiliser la MÊME base que le backend (ordre : package → racine → backend)
      dotenv.config();
      dotenv.config({ path: resolve(__dirname, '../../../.env') });
      dotenv.config({ path: resolve(__dirname, '../../../apps/backend/.env') });
    }

    const { db } = await import('./index.js');
    console.log('🔄 Running migrations...');
    const migrationsFolder = resolve(__dirname, './migrations');

    // Certains déploiements Upsun lancent le hook avant que Postgres soit 100% prêt.
    // On retente quelques fois sur erreurs réseau/transitoires.
    const maxAttempts = 5;
    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await migrate(db, { migrationsFolder });
        console.log('✅ Migrations completed successfully!');
        process.exit(0);
      } catch (error) {
        lastError = error;
        const transient =
          error instanceof Error &&
          (error.message.includes('ECONNRESET') ||
            error.message.toLowerCase().includes('socket disconnected') ||
            error.message.toLowerCase().includes('tls'));

        console.warn(
          `⚠️ Migrations attempt ${attempt}/${maxAttempts} failed${transient ? ' (transient)' : ''}.`
        );

        if (!transient || attempt === maxAttempts) break;

        // Backoff simple: 2s, 4s, 6s, 8s...
        const waitMs = 2000 * attempt;
        await new Promise((r) => setTimeout(r, waitMs));
      }
    }

    throw lastError;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();

