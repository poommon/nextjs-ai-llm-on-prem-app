import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    host: process.env.PG_HOST || 'localhost',
    port: Number(process.env.PG_PORT) || 5432,
    user: process.env.PG_USER || 'root',
    password: process.env.PG_PASSWORD || 'Admin_1jj395qu',
    database: process.env.PG_DATABASE || 'mydb',
    ssl: false,
  },
});
