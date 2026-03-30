import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: '../../.env' });
dotenv.config({ path: '../../apps/backend/.env' });

function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  if (fromEnv) return fromEnv;

  const raw = process.env.PLATFORM_RELATIONSHIPS?.trim();
  if (raw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    } catch {
      throw new Error('Invalid PLATFORM_RELATIONSHIPS: failed to decode base64 or parse JSON');
    }

    const root = parsed as Record<string, unknown>;
    const databaseRel = root.database;
    if (!Array.isArray(databaseRel) || databaseRel.length === 0) {
      throw new Error(
        'PLATFORM_RELATIONSHIPS: expected non-empty "database" relationship (database: "postgres:postgresql")'
      );
    }

    const cred = databaseRel[0] as Record<string, string | number | undefined>;
    const hostVal = cred.host ?? cred.hostname;
    const host = hostVal != null && String(hostVal) !== '' ? String(hostVal) : '';
    const port =
      cred.port != null && String(cred.port) !== '' ? String(cred.port) : '5432';
    const username = String(cred.username ?? '');
    const password = String(cred.password ?? '');

    let path = cred.path != null && String(cred.path) !== '' ? String(cred.path) : 'postgres';
    path = path.replace(/^\//, '') || 'postgres';

    if (!host || !username) {
      throw new Error('PLATFORM_RELATIONSHIPS: database entry missing host or username');
    }

    const u = encodeURIComponent(username);
    const p = encodeURIComponent(password);
    // Upsun/Platform.sh: connexion interne, ne pas forcer TLS ici.
    return `postgresql://${u}:${p}@${host}:${port}/${path}`;
  }

  throw new Error('No database configuration found');
}

const url = resolveDatabaseUrl();

export default defineConfig({
  schema: './src/schema.ts',
  out: './src/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
});
