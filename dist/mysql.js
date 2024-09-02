"use strict";
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
exports.query = query;
exports.queryEx = queryEx;
exports.beginTransaction = beginTransaction;
exports.commit = commit;
exports.rollback = rollback;
const serverlessMysql_1 = __importDefault(require("./serverlessMysql"));
const db = (0, serverlessMysql_1.default)({
    config: {
        host: process.env.DATABASE_HOST,
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        charset: "utf8mb4"
    },
    library: require('mysql2')
});
function query(query, args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield db.query(query, args);
            yield db.end();
            return results;
        }
        catch (error) {
            return { error };
        }
    });
}
function queryEx(query, args) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield db.query(query, args);
            yield db.end();
            return [results, null];
        }
        catch (error) {
            return [null, error];
        }
    });
}
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
exports.default = db;
// class Database {
// 	public db: mysql.Pool;
// 	constructor()
// 	{
// 		this.db = mysql.createPool({
// 			host: process.env.DB_HOST,
// 			user: process.env.DB_USER,
// 			password: process.env.DB_PASS,
// 			waitForConnections: true,
// 			connectionLimit: 10,
// 			queueLimit: 0,
// 			charset: "latin1"
// 		});
// 	}
// 	query = async (sql, args) => {
// 		return new Promise((resolve, reject) => {
// 			this.db.execute(sql, args, (err, rows) => {
// 				if (err)
// 					return reject(err);
// 				resolve(rows);
// 			});
// 		});
// 	}
// }
// export const {query, db} = new Database();
