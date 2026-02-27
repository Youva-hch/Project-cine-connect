import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Get database connection string from environment variables
const connectionString = process.env.DATABASE_URL || 
  `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}/${process.env.DB_NAME || 'cineconnect_dev'}`;

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

