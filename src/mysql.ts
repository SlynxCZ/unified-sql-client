"use strict";

// ----------[ SERVER: DB CONNECTION ]----------
import * as dotenv from 'dotenv';
dotenv.config();

import mysql from 'mysql2/promise';
import { Pool as PgPool } from 'pg';

type SupportedDriver = 'mysql' | 'pg';
type GenericPool = mysql.Pool | PgPool;

let db: GenericPool | null = null;
let driver: SupportedDriver = 'mysql'; // default

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

export function setConnection(config: DbConnectionConfig) {
  driver = config.driver || 'mysql';

  db = driver === 'pg'
    ? new PgPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
    })
    : mysql.createPool({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      charset: 'utf8mb4',
    });
}

export function useEnvConnection(selectedDriver: SupportedDriver = 'mysql') {
  driver = selectedDriver;
  const isProd = process.env.NODE_ENV === 'production';

  const config: DbConnectionConfig = {
    host: process.env[isProd ? 'DB_HOST' : 'DEV_DB_HOST'] || 'localhost',
    user: process.env[isProd ? 'DB_USER' : 'DEV_DB_USER'] || 'root',
    password: process.env[isProd ? 'DB_PASSWORD' : 'DEV_DB_PASSWORD'] || '',
    database: process.env[isProd ? 'DB_NAME' : 'DEV_DB_NAME'] || '',
    driver: selectedDriver,
  };

  setConnection(config);
}

export async function query(query: string, args: any[]): Promise<any> {
  if (!db) throw new Error('Database connection is not initialized.');

  try {
    if (driver === 'pg') {
      const res = await (db as PgPool).query(query, args);
      return res.rows;
    } else {
      const [rows] = await (db as mysql.Pool).query(query, args);
      return rows;
    }
  } catch (error) {
    return { error };
  }
}

export async function queryEx<T>(queryEx: string, args: any[]): Promise<[T | null, DbError | null]> {
  try {
    const result = await query(queryEx, args);
    if ('error' in result) return [null, result as DbError];
    return [result as T, null];
  } catch (err) {
    return [null, err as DbError];
  }
}

export async function beginTransaction() {
  if (!db || driver === 'pg') return;
  const connection = await (db as mysql.Pool).getConnection();
  await connection.beginTransaction();
  connection.release();
}

export async function commit() {
  if (!db || driver === 'pg') return;
  const connection = await (db as mysql.Pool).getConnection();
  await connection.commit();
  connection.release();
}

export async function rollback() {
  if (!db || driver === 'pg') return;
  const connection = await (db as mysql.Pool).getConnection();
  await connection.rollback();
  connection.release();
}

// ----------[ CLIENT: useFetcher Hook ]----------
import useSWR, { SWRConfiguration } from "swr";
import axios, { Method } from "axios";

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

type UseFetcherGetOptions = {
  method: HttpMethod.GET;
  url: string | null;
  config?: SWRConfiguration;
};

type UseFetcherMutateOptions<TPayload = any> = {
  method: HttpMethod.POST | HttpMethod.PUT | HttpMethod.DELETE;
  url: string;
  payload?: TPayload;
};

export function useFetcher<TResponse = any>(
  options: UseFetcherGetOptions
): {
  data: TResponse | undefined;
  error: any;
  isLoading: boolean;
};

export function useFetcher<TResponse = any, TPayload = any>(
  options: UseFetcherMutateOptions<TPayload>
): {
  trigger: () => Promise<TResponse>;
};

export function useFetcher<TResponse = any, TPayload = any>(
  options: UseFetcherGetOptions | UseFetcherMutateOptions<TPayload>
) {
  const isGet = options.method === HttpMethod.GET;

  const swr = useSWR<TResponse>(
    isGet && options.url ? options.url : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      return res.json();
    },
    {
      revalidateOnFocus: false,
      ...(isGet ? (options as UseFetcherGetOptions).config : {}),
    }
  );

  if (isGet) {
    return {
      data: swr.data,
      error: swr.error,
      isLoading: !swr.data && !swr.error,
    };
  }

  const { url, payload } = options as UseFetcherMutateOptions<TPayload>;

  const trigger = async () => {
    const res = await axios.request<TResponse>({
      method: options.method as Method,
      url,
      data: payload,
    });

    return res.data;
  };

  return {
    trigger,
  };
}

export default db;
