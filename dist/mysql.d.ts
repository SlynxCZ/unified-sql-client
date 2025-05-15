import mysql from 'mysql2/promise';
import { Pool as PgPool } from 'pg';
type SupportedDriver = 'mysql' | 'pg';
type GenericPool = mysql.Pool | PgPool;
declare let db: GenericPool | null;
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
export declare function query(query: string, args: any[]): Promise<any>;
export declare function queryEx<T>(queryEx: string, args: any[]): Promise<[T | null, DbError | null]>;
export declare function beginTransaction(): Promise<void>;
export declare function commit(): Promise<void>;
export declare function rollback(): Promise<void>;
import { SWRConfiguration } from "swr";
export declare enum HttpMethod {
    GET = "GET",
    POST = "POST",
    PUT = "PUT",
    DELETE = "DELETE"
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
export declare function useFetcher<TResponse = any>(options: UseFetcherGetOptions): {
    data: TResponse | undefined;
    error: any;
    isLoading: boolean;
};
export declare function useFetcher<TResponse = any, TPayload = any>(options: UseFetcherMutateOptions<TPayload>): {
    trigger: () => Promise<TResponse>;
};
export default db;
