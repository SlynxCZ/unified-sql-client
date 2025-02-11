"use strict";

// Načti proměnné z .env souboru
import * as dotenv from 'dotenv';
dotenv.config(); // Inicializuje proměnné prostředí

// Načti serverlessMysql z relativní cesty
import { createPool, Pool } from 'mysql2/promise';

// Deklaruj db jako null
let db: Pool | null = null; // Povolíme null jako výchozí hodnotu

// Typ pro připojení
export interface DbConnectionConfig {
  host: string;
  user: string;
  password: string;
}

export interface MySQLError{
  code: string;
  error: string;
}

// Funkce pro nastavení připojení
export function setConnection(config: DbConnectionConfig) {
  db = createPool({
    host: config.host,
    user: config.user,
    password: config.password,
    charset: 'utf8mb4',
  });
}

// Funkce pro používání výchozího připojení z .env
export function useEnvConnection() {
  db = createPool({
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    charset: 'utf8mb4',
  });
}

// Funkce pro spouštění SQL dotazů
export async function query(query: string, args: any[]): Promise<any> {
  if (!db) {
    throw new Error('Database connection is not initialized.');
  }

  try {
    const [results] = await db.query(query, args);
    return results;
  } catch (error) {
    return { error };
  }
}

// Rozšířená funkce pro spouštění SQL dotazů s chybovým hlášením
export async function queryEx<T>(query: string, args: any[]): Promise<[T | null, MySQLError | null]> {
  if (!db) {
    throw new Error('Database connection is not initialized.');
  }

  try {
    const [results] = await db.query(query, args);
    return [results as T, null];
  } catch (error) {
    return [null, error as MySQLError];
  }
}

// Funkce pro začátek transakce
export async function beginTransaction() {
  if (!db) {
    throw new Error('Database connection is not initialized.');
  }

  try {
    await db.query('START TRANSACTION');
  } catch (error) {
    console.error('Failed to start transaction', error);
    throw error;
  }
}

// Funkce pro potvrzení transakce
export async function commit() {
  if (!db) {
    throw new Error('Database connection is not initialized.');
  }

  try {
    await db.query('COMMIT');
  } catch (error) {
    console.error('Failed to commit transaction', error);
    throw error;
  }
}

// Funkce pro vrácení transakce
export async function rollback() {
  if (!db) {
    throw new Error('Database connection is not initialized.');
  }

  try {
    await db.query('ROLLBACK');
  } catch (error) {
    console.error('Failed to rollback transaction', error);
    throw error;
  }
}

// Export databázového připojení pro další použití
export default db;
