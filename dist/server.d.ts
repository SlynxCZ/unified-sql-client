type SupportedDriver = "mysql" | "pg";
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
export declare function setConnection(config: DbConnectionConfig): void;
export declare function useEnvConnection(selectedDriver?: SupportedDriver): void;
export declare function query(query: string, args?: any[]): Promise<any>;
export declare function queryEx<T>(queryEx: string, args?: any[]): Promise<[T | null, DbError | null]>;
export declare function beginTransaction(): Promise<void>;
export declare function commit(): Promise<void>;
export declare function rollback(): Promise<void>;
export {};
