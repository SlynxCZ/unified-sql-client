import mysql from './serverlessMysql';

const db = mysql({
  config: {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    charset: "utf8mb4"
  },
  library: require('mysql2')
})

export interface MySQLError {
  error: string,
  code: string
}

export async function query(query: string, args: any[]): Promise<any> {
  try {
    const results = await db.query(query, args);
    await db.end();
    return results;
  } catch (error) {
    return { error };
  }
}
export async function queryEx<T>(query: string, args: any[]): Promise<[T | null, MySQLError | null]> {
  try {
    const results = await db.query(query, args);
    await db.end();
    return [results as T, null];
  } catch (error) {
    return [null, error as MySQLError];
  }
}

export async function beginTransaction() {
  try {
    await db.query('START TRANSACTION');
  } catch (error) {
    console.error('Failed to start transaction', error);
    throw error;
  }
}

export async function commit() {
  try {
    await db.query('COMMIT');
  } catch (error) {
    console.error('Failed to commit transaction', error);
    throw error;
  }
}

export async function rollback() {
  try {
    await db.query('ROLLBACK');
  } catch (error) {
    console.error('Failed to rollback transaction', error);
    throw error;
  }
}

export default db;

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