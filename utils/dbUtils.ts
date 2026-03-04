import { Client } from 'pg';

/**
 * Creates and connects a PostgreSQL client using environment variables.
 * Call disconnect() after your queries are done.
 *
 * Required .env variables:
 *   DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD
 */
export async function createDbClient(): Promise<Client> {
  const client = new Client({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });
  await client.connect();
  return client;
}

/**
 * Runs a single query and disconnects automatically.
 * Use for one-off queries where you don't need to reuse the connection.
 */
export async function runQuery<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const client = await createDbClient();
  try {
    const result = await client.query(sql, params);
    return result.rows as T[];
  } finally {
    await client.end();
  }
}
