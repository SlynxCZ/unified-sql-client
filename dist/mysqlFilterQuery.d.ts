export declare class FilteredQuery {
    query: string;
    params: [string, (string | number), string][];
    constructor(query: string);
    addFilter(filter: string, value: string | number, operator?: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE"): void;
    execute(): Promise<[unknown, import("./mysql").MySQLError | null]>;
}
