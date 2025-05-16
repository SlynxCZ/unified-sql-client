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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b;
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
    ((_b = (_a = process.env.DATABASE_URL) === null || _a === void 0 ? void 0 : _a.includes(".neon.tech")) !== null && _b !== void 0 ? _b : false);
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
    var _a, _b, _c, _d;
    driver = selectedDriver;
    const isProd = process.env.NODE_ENV === "production";
    const config = {
        host: (_a = process.env[isProd ? "DB_HOST" : "DEV_DB_HOST"]) !== null && _a !== void 0 ? _a : "localhost",
        user: (_b = process.env[isProd ? "DB_USER" : "DEV_DB_USER"]) !== null && _b !== void 0 ? _b : "root",
        password: (_c = process.env[isProd ? "DB_PASSWORD" : "DEV_DB_PASSWORD"]) !== null && _c !== void 0 ? _c : "",
        database: (_d = process.env[isProd ? "DB_NAME" : "DEV_DB_NAME"]) !== null && _d !== void 0 ? _d : "",
        driver: selectedDriver,
    };
    setConnection(config);
}
function toTemplateStringsArray(parts) {
    const cooked = [...parts];
    cooked.raw = [...parts];
    return cooked;
}
function query(query_1) {
    return __awaiter(this, arguments, void 0, function* (query, args = []) {
        if (!db)
            throw new Error("Database connection is not initialized.");
        try {
            if (driver === "pg") {
                if (usingNeon) {
                    const sql = db;
                    if (!args || args.length === 0) {
                        return yield sql([query]);
                    }
                    const parts = query.split(/\$\d+/);
                    if (parts.length !== args.length + 1) {
                        return { error: "Amount of arguments doesn't match amount of placeholders." };
                    }
                    const tParts = toTemplateStringsArray(parts);
                    return yield sql(tParts, ...args);
                }
                else {
                    const res = yield db.query(query, args);
                    return res.rows;
                }
            }
            else {
                const [rows] = yield db.query(query, args);
                return rows;
            }
        }
        catch (error) {
            return { error };
        }
    });
}
function queryEx(queryEx_1) {
    return __awaiter(this, arguments, void 0, function* (queryEx, args = []) {
        try {
            const result = yield query(queryEx, args);
            if ("error" in result)
                return [null, result];
            return [result, null];
        }
        catch (err) {
            return [null, err];
        }
    });
}
function beginTransaction() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db || driver === "pg" || usingNeon)
            return;
        const connection = yield db.getConnection();
        yield connection.beginTransaction();
        connection.release();
    });
}
function commit() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db || driver === "pg" || usingNeon)
            return;
        const connection = yield db.getConnection();
        yield connection.commit();
        connection.release();
    });
}
function rollback() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db || driver === "pg" || usingNeon)
            return;
        const connection = yield db.getConnection();
        yield connection.rollback();
        connection.release();
    });
}
