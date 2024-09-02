import mysql from './serverlessMysql';
declare const db: mysql.ServerlessMysql;
export interface MySQLError {
    error: string;
    code: string;
}
export declare function query(query: string, args: any[]): Promise<any>;
export declare function queryEx<T>(query: string, args: any[]): Promise<[T | null, MySQLError | null]>;
export declare function beginTransaction(): Promise<void>;
export declare function commit(): Promise<void>;
export declare function rollback(): Promise<void>;
export default db;
