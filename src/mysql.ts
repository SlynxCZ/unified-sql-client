// import pg from 'pg';
import { Pool } from 'pg';

const db = new Pool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: process.env.NODE_ENV === "production" ? parseInt(process.env.DB_PORT || "5432", 10) : parseInt(process.env.DEV_DB_PORT || "5432", 10),
});

export interface PGError {
  error: string,
  code: string
}

export async function query(query: string, args: any) {
  try {
    const client = await db.connect();
    const results = await client.query(query, args);
    client.release();
    return results.rows; // PostgreSQL vrací výsledky v `rows`
  } catch (error) {
    return { error };
  }
}

export async function queryEx<T>(query: string, args: any): Promise<[T | null, PGError | null]> {
  try {
    const client = await db.connect();
    const results = await client.query(query, args);
    client.release();
    return [results.rows as T, null];
  } catch (error) {
    return [null, error as PGError];
  }
}

export async function beginTransaction() {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    return client;
  } catch (error) {
    console.error('Failed to start transaction', error);
    client.release();
    throw error;
  }
}

export async function commit(client: any) {
  try {
    await client.query('COMMIT');
    client.release();
  } catch (error) {
    console.error('Failed to commit transaction', error);
    client.release();
    throw error;
  }
}

export async function rollback(client: any) {
  try {
    await client.query('ROLLBACK');
    client.release();
  } catch (error) {
    console.error('Failed to rollback transaction', error);
    client.release();
    throw error;
  }
}

export default db;
