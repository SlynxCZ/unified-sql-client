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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const pg_1 = require("pg");
let db = null;
let driver = 'mysql'; // default
function setConnection(config) {
    driver = config.driver || 'mysql';
    db = driver === 'pg'
        ? new pg_1.Pool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
        })
        : promise_1.default.createPool({
            host: config.host,
            user: config.user,
            password: config.password,
            database: config.database,
            charset: 'utf8mb4',
        });
}
function useEnvConnection(selectedDriver = 'mysql') {
    driver = selectedDriver;
    const isProd = process.env.NODE_ENV === 'production';
    const config = {
        host: process.env[isProd ? 'DB_HOST' : 'DEV_DB_HOST'] || 'localhost',
        user: process.env[isProd ? 'DB_USER' : 'DEV_DB_USER'] || 'root',
        password: process.env[isProd ? 'DB_PASSWORD' : 'DEV_DB_PASSWORD'] || '',
        database: process.env[isProd ? 'DB_NAME' : 'DEV_DB_NAME'] || '',
        driver: selectedDriver,
    };
    setConnection(config);
}
function query(query, args) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db)
            throw new Error('Database connection is not initialized.');
        try {
            if (driver === 'pg') {
                const res = yield db.query(query, args);
                return res.rows;
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
function queryEx(queryEx, args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const result = yield query(queryEx, args);
            if ('error' in result)
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
        if (!db || driver === 'pg')
            return;
        const connection = yield db.getConnection();
        yield connection.beginTransaction();
        connection.release();
    });
}
function commit() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db || driver === 'pg')
            return;
        const connection = yield db.getConnection();
        yield connection.commit();
        connection.release();
    });
}
function rollback() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!db || driver === 'pg')
            return;
        const connection = yield db.getConnection();
        yield connection.rollback();
        connection.release();
    });
}
exports.default = db;
