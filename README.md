# MySQL-Enhanced

MySQL-Enhanced is package that allows you to fastly run SQL code everywhere at any time

To run SQL code, you have 2 functions called query and queryEx(query for async functions), you need to set these values in environment variables .env to work with your database.
you don't need to specify name of database because you can use multiple databases in query or queryEx.


.env file must look like this:

  DATABASE_HOST=%host%
  DATABASE_USER=%user%
  DATABASE_PASSWORD=%password%


Now you can use queryEx inside function like:

  async function SQL() {
    queryEx('SELECT \* FROM table where id = ?',[100])
  }

  SQL()