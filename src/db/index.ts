import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create PostgreSQL connection pool
const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: Number(process.env.PG_PORT) || 5432,
  user: process.env.PG_USER || 'root',
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE || 'mydb',
  ssl: false,
});

// Create Drizzle instance with schema
export const db = drizzle(pool, { schema });

// Export pool for direct access if needed
export { pool };
