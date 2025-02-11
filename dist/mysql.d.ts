import { Pool } from 'mysql2/promise';
declare let db: Pool | null;
export interface DbConnectionConfig {
    host: string;
    user: string;
    password: string;
}
export interface MySQLError {
    code: string;
    error: string;
}
export declare function setConnection(config: DbConnectionConfig): void;
export declare function useEnvConnection(): void;
export declare function query(query: string, args: any[]): Promise<any>;
export declare function queryEx<T>(query: string, args: any[]): Promise<[T | null, MySQLError | null]>;
export declare function beginTransaction(): Promise<void>;
export declare function commit(): Promise<void>;
export declare function rollback(): Promise<void>;
export default db;
