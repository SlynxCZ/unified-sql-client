# unified-sql-client

**unified-sql-client** is a universal SQL and data-fetching library for Node.js and React applications. It supports **MySQL**, **MariaDB**, **PostgreSQL**, and **Neon serverless**, making it suitable for both traditional and serverless environments. It also includes a built-in `fetcher` React hook for easy data fetching from REST APIs.

---

## 📦 Installation

```bash
npm install unified-sql-client
````

---

## 🌐 Environment Setup

Make sure your `.env` file is configured correctly to support dynamic environment-based connections.

### ✅ For PostgreSQL / Neon:

```
DATABASE_URL=postgres://user:password@hostname:port/database
USE_NEON_DRIVER=true
```

The `USE_NEON_DRIVER` flag can also be automatically detected if your URL includes `.neon.tech`.

### ✅ For MySQL / MariaDB:

```ini
# Production
DB_HOST=your-production-host
DB_USER=your-production-user
DB_PASSWORD=your-production-password
DB_NAME=your-production-db

# Development (fallback)
DEV_DB_HOST=localhost
DEV_DB_USER=root
DEV_DB_PASSWORD=
DEV_DB_NAME=local_db
```

The driver is auto-configured depending on `NODE_ENV`.

---

## 🚀 Usage

### 1. Backend SQL Queries (`useDb`)

#### `queryEx` – safe result + error return:

```ts
import { useEnvConnection, queryEx } from "unified-sql-client/server";

useEnvConnection("pg"); // Or MySQL

const [result, error] = await queryEx("SELECT * FROM users WHERE id = $1", [1]);

if (error) {
  console.error("DB Error:", error);
} else {
  console.log("Data:", result);
}
```

#### `query` – direct result:

```ts
import { query } from "unified-sql-client/server";

const users = await query("SELECT * FROM users");
console.log(users);
```

---

### 2. Frontend React Hook (`fetcher`)

```tsx
import { useFetcher, HttpMethod } from "unified-sql-client/fetcher";

const { data, error, isLoading } = useFetcher({
  method: HttpMethod.GET,
  url: "/api/posts",
});
```

#### For mutations (POST/PUT/DELETE):

```tsx
const { trigger } = useFetcher({
  method: HttpMethod.POST,
  url: "/api/post",
  payload: { title: "Hello", content: "World" },
});

await trigger();
```

---

## ⚙️ Configuration Options

You can also manually set a custom connection:

```ts
import { setConnection } from "unified-sql-client/server";

setConnection({
  host: "localhost",
  user: "admin",
  password: "secret",
  database: "mydb",
  driver: "pg",
});
```

---

## ✅ Features

* 🔄 **Dynamic `.env` config** based on environment
* 🧩 **MySQL / MariaDB / PostgreSQL / Neon** support
* 🚀 **Type-safe wrapper** with `queryEx<T>()`
* 🔗 **React `useFetcher` hook** for API fetches
* 🔒 Safe error handling for SQL operations
* ⚡ Works in **serverless environments** like Vercel

---

## 📘 API Reference

### `server` (server-side)

* `query(query: string, args: any[]): Promise<any>`
* `queryEx<T>(query: string, args: any[]): Promise<[T | null, DbError | null]>`
* `useEnvConnection(driver?: "mysql" | "pg")`
* `setConnection(config: DbConnectionConfig)`
* `beginTransaction()`, `commit()`, `rollback()` (MySQL only)

### `fetcher` (client-side)

* `useFetcher<T>(options: { method, url, payload? })`

    * GET: returns `{ data, error, isLoading }`
    * POST/PUT/DELETE: returns `{ trigger }`

---

## 🧪 Example `.env` (for Neon)

```env
DATABASE_URL=postgres://user:pass@ep-xyz.neon.tech/dbname?sslmode=require
USE_NEON_DRIVER=true
```

---

## 📝 License

MIT License © 2025 [slynxcz](https://github.com/slynxcz)