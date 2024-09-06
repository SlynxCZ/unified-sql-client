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
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = query;
exports.queryEx = queryEx;
exports.beginTransaction = beginTransaction;
exports.commit = commit;
exports.rollback = rollback;
// Načti proměnné z .env souboru
const dotenv = __importStar(require("dotenv"));
dotenv.config(); // Inicializuje proměnné prostředí
// Načti serverlessMysql z relativní cesty
const promise_1 = require("mysql2/promise");
const db = (0, promise_1.createPool)({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
});
// Funkce pro spouštění SQL dotazů
function query(query, args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [results] = yield db.query(query, args);
            yield db.end(); // Ukonči připojení po dotazu
            return results;
        }
        catch (error) {
            return { error }; // Vrať chybu, pokud dotaz selže
        }
    });
}
// Rozšířená funkce pro spouštění SQL dotazů s chybovým hlášením
function queryEx(query, args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const [results] = yield db.query(query, args);
            yield db.end(); // Ukonči připojení po dotazu
            return [results, null]; // Vrať výsledek a null pro chybu
        }
        catch (error) {
            return [null, error]; // Vrať null pro výsledek a chybu
        }
    });
}
// Funkce pro začátek transakce
function beginTransaction() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.query('START TRANSACTION');
        }
        catch (error) {
            console.error('Failed to start transaction', error);
            throw error;
        }
    });
}
// Funkce pro potvrzení transakce
function commit() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.query('COMMIT');
        }
        catch (error) {
            console.error('Failed to commit transaction', error);
            throw error;
        }
    });
}
// Funkce pro vrácení transakce
function rollback() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield db.query('ROLLBACK');
        }
        catch (error) {
            console.error('Failed to rollback transaction', error);
            throw error;
        }
    });
}
// Export databázového připojení pro další použití
exports.default = db;
