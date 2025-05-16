"use strict";
import * as dotenv from "dotenv";
dotenv.config();
import mysql from "mysql2/promise";
import { neon } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
let db = null;
let driver = "mysql";
const usingNeon = process.env.USE_NEON_DRIVER === "true" ||
    (process.env.DATABASE_URL?.includes(".neon.tech") ?? false);
export function setConnection(config) {
    driver = config.driver || "mysql";
    if (driver === "pg") {
        if (usingNeon) {
            db = neon(process.env.DATABASE_URL);
        }
        else {
            db = new PgPool({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database,
                ssl: { rejectUnauthorized: false },
            });
        }
    }
    else {
        db = mysql.createPool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            charset: "utf8mb4",
        });
    }
}
export function useEnvConnection(selectedDriver = "mysql") {
    driver = selectedDriver;
    const isProd = process.env.NODE_ENV === "production";
    const config = {
        host: process.env[isProd ? "DB_HOST" : "DEV_DB_HOST"] ?? "localhost",
        user: process.env[isProd ? "DB_USER" : "DEV_DB_USER"] ?? "root",
        password: process.env[isProd ? "DB_PASSWORD" : "DEV_DB_PASSWORD"] ?? "",
        database: process.env[isProd ? "DB_NAME" : "DEV_DB_NAME"] ?? "",
        driver: selectedDriver,
    };
    setConnection(config);
}
function toTemplateStringsArray(parts) {
    const cooked = [...parts];
    cooked.raw = [...parts];
    return cooked;
}
export async function query(query, args = []) {
    if (!db)
        throw new Error("Database connection is not initialized.");
    try {
        if (driver === "pg") {
            if (usingNeon) {
                const sql = db;
                if (!args || args.length === 0) {
                    return await sql([query]);
                }
                const parts = query.split(/\$\d+/);
                if (parts.length !== args.length + 1) {
                    return { error: "Amount of arguments doesn't match amount of placeholders." };
                }
                const tParts = toTemplateStringsArray(parts);
                return await sql(tParts, ...args);
            }
            else {
                const res = await db.query(query, args);
                return res.rows;
            }
        }
        else {
            const [rows] = await db.query(query, args);
            return rows;
        }
    }
    catch (error) {
        return { error };
    }
}
export async function queryEx(queryEx, args = []) {
    try {
        const result = await query(queryEx, args);
        if ("error" in result)
            return [null, result];
        return [result, null];
    }
    catch (err) {
        return [null, err];
    }
}
export async function beginTransaction() {
    if (!db || driver === "pg" || usingNeon)
        return;
    const connection = await db.getConnection();
    await connection.beginTransaction();
    connection.release();
}
export async function commit() {
    if (!db || driver === "pg" || usingNeon)
        return;
    const connection = await db.getConnection();
    await connection.commit();
    connection.release();
}
export async function rollback() {
    if (!db || driver === "pg" || usingNeon)
        return;
    const connection = await db.getConnection();
    await connection.rollback();
    connection.release();
}
