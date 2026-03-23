import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

function buildDbUrlFromDiscreteVars() {
  const user = process.env.DB_USER || 'postgres';
  const password = process.env.DB_PASSWORD || 'postgres';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '5432';
  const database = process.env.DB_NAME || 'cineconnect_dev';
  return `postgresql://${user}:${password}@${host}:${port}/${database}`;
}

// En dev local, préférer DB_* pour éviter qu'un DATABASE_URL global du shell casse la connexion.
const isProduction = process.env.NODE_ENV === 'production';
const hasDiscreteDbConfig = Boolean(
  process.env.DB_HOST ||
  process.env.DB_PORT ||
  process.env.DB_USER ||
  process.env.DB_PASSWORD ||
  process.env.DB_NAME
);

const connectionString = isProduction
  ? (process.env.DATABASE_URL || buildDbUrlFromDiscreteVars())
  : (hasDiscreteDbConfig ? buildDbUrlFromDiscreteVars() : (process.env.DATABASE_URL || buildDbUrlFromDiscreteVars()));

// Create the postgres client
// Use max: 1 for migrations, but allow more connections for regular use
const client = postgres(connectionString, {
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
});

// Create the drizzle instance
export const db = drizzle(client, { schema });

// Export schema for use in other packages
export * from './schema.js';

// Export commonly used drizzle-orm functions
export { eq, and, or, not, sql, desc, asc, like, inArray, isNull, gte, lte } from 'drizzle-orm';

// Export types
export type Database = typeof db;

