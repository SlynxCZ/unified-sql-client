# MySQL-Enhanced

**MySQL-Enhanced** is a package that allows you to quickly run SQL code at any time and from anywhere within your Node.js applications. It provides two primary functions, `query` and `queryEx`, for efficient interaction with MySQL databases. This module supports connection management using environment variables and can be extended to support multiple databases.

## Installation

1. Install the package using npm:

```bash
npm install mysql-enhanced
```

2. Ensure that your `.env` file is set up correctly in the root of your project. It should contain the following variables:

### `.env` file example:

```
DATABASE_HOST=your-database-host
DATABASE_USER=your-database-username
DATABASE_PASSWORD=your-database-password
```

These variables will be used to establish the database connection.

## Usage

You can use the `query` and `queryEx` functions to run SQL queries:

### Example of using `queryEx`:

```typescript
import { queryEx } from 'mysql-enhanced';

async function SQL() {
  const [result, error] = await queryEx('SELECT * FROM table WHERE id = ?', [100]);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Result:', result);
  }
}

SQL();
```

### Example of using `query`:

```typescript
import { query } from 'mysql-enhanced';

async function SQL() {
  const result = await query('SELECT * FROM table WHERE id = ?', [100]);
  console.log('Result:', result);
}

SQL();
```

## Environment Configuration

You don’t need to specify the database name in your queries. This module allows you to work with multiple databases in a single query by using the `query` and `queryEx` functions. You can extend this functionality by setting additional configurations and managing database connections dynamically.

### Connecting via `.env`

The module automatically loads the database connection settings from the `.env` file, so you don’t need to hardcode sensitive information in your codebase. If necessary, you can extend the module to support dynamic connections for different environments.

## Extending the Module

This package is designed to be extendable. You can customize it to fit your needs, whether it's adding support for additional configurations or creating more complex database interactions. Simply import and modify the functions as needed for your application.

```typescript
import { setConnection } from 'mysql-enhanced';

// Example of setting a custom connection
setConnection({
  host: 'custom-host',
  user: 'custom-user',
  password: 'custom-password',
});
```

## Features

- **Multiple Database Support**: Use multiple databases in queries without specifying the database name directly.
- **Environment Configured**: Connect to your database using environment variables defined in your `.env` file.
- **Extendable**: Easily extend the module to add more functionality or configurations.
- **Simple API**: Use `query` and `queryEx` for running SQL queries asynchronously.

## Functions

### `query(query: string, args: any[]): Promise<any>`

Executes a SQL query and returns the result. If an error occurs, it is returned in the response.

### `queryEx<T>(query: string, args: any[]): Promise<[T | null, MySQLError | null]>`

Executes a SQL query with error handling. Returns the result and any errors encountered during the execution.

### `setConnection(config: DbConnectionConfig)`

Sets a custom database connection. Can be used to change connection details dynamically.

### `useEnvConnection()`

Uses the connection details from the `.env` file to establish a connection.

### `beginTransaction()`

Begins a new transaction.

### `commit()`

Commits the current transaction.

### `rollback()`

Rolls back the current transaction.

## License

This package is released under the MIT License. See the [LICENSE](LICENSE) file for more details.

---