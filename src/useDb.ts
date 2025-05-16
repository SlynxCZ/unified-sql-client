"use strict";

import * as dotenv from "dotenv";
dotenv.config();

import mysql from "mysql2/promise";
import { neon } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";

type SupportedDriver = "mysql" | "pg";
type NeonClient = ReturnType<typeof neon>;
type GenericPool = mysql.Pool | PgPool | NeonClient;

let db: GenericPool | null = null;
let driver: SupportedDriver = "mysql";

export interface DbConnectionConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  driver?: SupportedDriver;
}

export interface DbError {
  code: string;
  error: string;
}

const usingNeon =
  process.env.USE_NEON_DRIVER === "true" ||
  (process.env.DATABASE_URL?.includes(".neon.tech") ?? false);

export function setConnection(config: DbConnectionConfig) {
  driver = config.driver || "mysql";

  if (driver === "pg") {
    if (usingNeon) {
      db = neon(process.env.DATABASE_URL!);
    } else {
      db = new PgPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        ssl: { rejectUnauthorized: false },
      });
    }
  } else {
    db = mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: "utf8mb4",
    });
  }
}

export function useEnvConnection(selectedDriver: SupportedDriver = "mysql") {
  driver = selectedDriver;
  const isProd = process.env.NODE_ENV === "production";

  const config: DbConnectionConfig = {
    host: process.env[isProd ? "DB_HOST" : "DEV_DB_HOST"] ?? "localhost",
    user: process.env[isProd ? "DB_USER" : "DEV_DB_USER"] ?? "root",
    password: process.env[isProd ? "DB_PASSWORD" : "DEV_DB_PASSWORD"] ?? "",
    database: process.env[isProd ? "DB_NAME" : "DEV_DB_NAME"] ?? "",
    driver: selectedDriver,
  };

  setConnection(config);
}

export async function query(query: string, args: any[] = []): Promise<any> {
  if (!db) throw new Error("Database connection is not initialized.");

  try {
    if (driver === "pg") {
      if (usingNeon) {
        const sql = db as NeonClient;
        return await sql(query as any, ...args);
      } else {
        const res = await (db as PgPool).query(query, args);
        return res.rows;
      }
    } else {
      const [rows] = await (db as mysql.Pool).query(query, args);
      return rows;
    }
  } catch (error) {
    return { error };
  }
}

export async function queryEx<T>(
  queryEx: string,
  args: any[] = []
): Promise<[T | null, DbError | null]> {
  try {
    const result = await query(queryEx, args);
    if ("error" in result) return [null, result as DbError];
    return [result as T, null];
  } catch (err) {
    return [null, err as DbError];
  }
}

export async function beginTransaction() {
  if (!db || driver === "pg" || usingNeon) return;
  const connection = await (db as mysql.Pool).getConnection();
  await connection.beginTransaction();
  connection.release();
}

export async function commit() {
  if (!db || driver === "pg" || usingNeon) return;
  const connection = await (db as mysql.Pool).getConnection();
  await connection.commit();
  connection.release();
}

export async function rollback() {
  if (!db || driver === "pg" || usingNeon) return;
  const connection = await (db as mysql.Pool).getConnection();
  await connection.rollback();
  connection.release();
}
