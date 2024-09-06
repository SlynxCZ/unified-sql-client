"use strict";

// Načti proměnné z .env souboru
import * as dotenv from 'dotenv';
dotenv.config(); // Inicializuje proměnné prostředí

// Načti serverlessMysql z relativní cesty
import { createPool } from 'mysql2/promise';

const db = createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
});

// Definice MySQLError rozhraní
export interface MySQLError {
  error: string;
  code: string;
}

// Funkce pro spouštění SQL dotazů
export async function query(query: string, args: any[]): Promise<any> {
  try {
    const [results] = await db.query(query, args);
    await db.end(); // Ukonči připojení po dotazu
    return results;
  } catch (error) {
    return { error }; // Vrať chybu, pokud dotaz selže
  }
}

// Rozšířená funkce pro spouštění SQL dotazů s chybovým hlášením
export async function queryEx<T>(query: string, args: any[]): Promise<[T | null, MySQLError | null]> {
  try {
    const [results] = await db.query(query, args);
    await db.end(); // Ukonči připojení po dotazu
    return [results as T, null]; // Vrať výsledek a null pro chybu
  } catch (error) {
    return [null, error as MySQLError]; // Vrať null pro výsledek a chybu
  }
}

// Funkce pro začátek transakce
export async function beginTransaction() {
  try {
    await db.query('START TRANSACTION');
  } catch (error) {
    console.error('Failed to start transaction', error);
    throw error;
  }
}

// Funkce pro potvrzení transakce
export async function commit() {
  try {
    await db.query('COMMIT');
  } catch (error) {
    console.error('Failed to commit transaction', error);
    throw error;
  }
}

// Funkce pro vrácení transakce
export async function rollback() {
  try {
    await db.query('ROLLBACK');
  } catch (error) {
    console.error('Failed to rollback transaction', error);
    throw error;
  }
}

// Export databázového připojení pro další použití
export default db;
