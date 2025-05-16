"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setConnection = setConnection;
exports.useEnvConnection = useEnvConnection;
exports.query = query;
exports.queryEx = queryEx;
exports.beginTransaction = beginTransaction;
exports.commit = commit;
exports.rollback = rollback;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const promise_1 = __importDefault(require("mysql2/promise"));
const serverless_1 = require("@neondatabase/serverless");
const pg_1 = require("pg");
let db = null;
let driver = "mysql";
const usingNeon = process.env.USE_NEON_DRIVER === "true" ||
    (process.env.DATABASE_URL?.includes(".neon.tech") ?? false);
function setConnection(config) {
    driver = config.driver || "mysql";
    if (driver === "pg") {
        if (usingNeon) {
            db = (0, serverless_1.neon)(process.env.DATABASE_URL);
        }
        else {
            db = new pg_1.Pool({
                host: config.host,
                user: config.user,
                password: config.password,
                database: config.database,
                ssl: { rejectUnauthorized: false },
            });
        }
    }
    else {
        db = promise_1.default.createPool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            charset: "utf8mb4",
        });
    }
}
function useEnvConnection(selectedDriver = "mysql") {
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
async function query(query, args = []) {
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
async function queryEx(queryEx, args = []) {
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
async function beginTransaction() {
    if (!db || driver === "pg" || usingNeon)
        return;
    const connection = await db.getConnection();
    await connection.beginTransaction();
    connection.release();
}
async function commit() {
    if (!db || driver === "pg" || usingNeon)
        return;
    const connection = await db.getConnection();
    await connection.commit();
    connection.release();
}
async function rollback() {
    if (!db || driver === "pg" || usingNeon)
        return;
    const connection = await db.getConnection();
    await connection.rollback();
    connection.release();
}
