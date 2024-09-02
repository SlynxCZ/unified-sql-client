import mysql, { queryEx } from '@/lib/mysql';

function escapeId(id: string): string {
	return '`' + id.replace(/`/g, '``') + '`';
}


export class FilteredQuery {
    query: string;
    params: [string, (string | number), string][] = [];

    constructor(query: string) {
        this.query = query;
    }

    addFilter(filter: string, value: string | number, operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "LIKE" = "=") {
        this.params.push([filter, value, operator]);
    }

    execute() {
        let whereClause = "";
        let queryParams = this.params.map(([, value]) => value);

        if (this.params.length > 0)
            whereClause = "WHERE " + this.params.map(([filter, , operator]) => `${escapeId(filter)} ${operator} ?`).join(" AND ");

        return queryEx(this.query.replace("%where%", whereClause), queryParams);
    }
}
