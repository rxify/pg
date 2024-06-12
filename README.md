# @rxifyjs/pg

Provides [RxJS](https://www.npmjs.com/package/rxjs) wrappers for
[node-postgres](https://www.npmjs.com/package/pg) and a cli for executing
local Postgres files and scripts.

We have attempted to create wrappers for most of the functionality that is
required for the middle tier of an application, including
connection pooling, cursors, query streaming, and one-off client creation.

If you identify a missing features or bug,
[open a PR](https://github.com/rxify/pg/pulls) or submit
[a feature request or bug report](https://github.com/rxify/pg/issues).

For detailed documentation, visit [our GitHub page](https://rxify.github.io/pg/).

## CLI

`pg-runner` is an awesome and lightweight alternative to Postgres IDEs,
providing developers with the ability to run local SQL scripts and queries
directly from their VSCode terminal.

For details about what the CLI can do, run `pg-runner --help` after installation.
In the meantime, we've provided a few examples below.

### Examples

If you are developing a function in a local file--let's call it
`get_all_users.sql`--you can execute the script with the following command:

```bash
$ sql-runner --path ./get_all_users.sql
```

If after running the script you want to call it in the database, you can run:

```bash
$ sql-runner --script "SELECT * FROM get_all_users()"
SELECT RETURNED 2 rows.
┌─────────┬────────────┬─────────────┬────────────────┐
│ (index) │  username  │ first_name  │   last_name    │
├─────────┼────────────┼─────────────┼────────────────┤
│    1    │   'JDOE'   │   'Jane'    │     'Doe'      │
│    2    │  'JSMITH'  │   'John'    │    'Smith'     │
└─────────┴────────────┴─────────────┴────────────────┘
```

#### Cursors

If you query includes cursors, include the `--cursors` flag in your command,
and `pg-runner` will automatically execute the script and `FETCH ALL`
from each returned cursor:

```bash
$ sql-runner --script "SELECT * FROM get_all_users()" --cursors
```

#### Dynamic Values

For scripts that accept arguments, you can pass them dynamically
by using the `--values` option, which accepts space-separated values:

```bash
$ sql-runner --script "SELECT * FROM get_user_by_lastname(\$1)" --values Smith
$ sql-runner --script "SELECT * FROM get_user_by_lastname_firstname(\$1, \$2)" --values Smith John
```

**NOTE:** Do not forget to escape your references (i.e. `"\$1"` instead of `"$1"`).

### Installation

To use `pg-runner` globally, run...

```bash
$ npm install -g @rxifyjs/pg
```

If you want to use `pg-runner` in your project, you can...

```bash
$ npm install --save @rxifyjs/pg
$ npx pg-runner ...
```

## Testing

This library uses the [`@databases/pg`](https://www.atdatabases.org/docs/pg-test)
library to test. Before testing, you need to run the following commands to
start and initialize the test database:

```bash
$ npm run db:start
$ npm run db:init
```

This will spin up a docker database instance and run an init script that creates
test tables, inserts their data, and creates test functions.

### Note on Unit Testing

When we implemented the
[Jest hooks outlined in the `@databases/pg` docs](https://www.atdatabases.org/docs/pg-test#jest),
we ran into an issue where the database is spun down before tests complete.
While we're working on fixing this issue, run the following command
before running unit tests:

```bash
$ npm run db:start
```

After tests have completed, run...

```bash
$ npm run db:stop
```

These commands will spin up and spin down a test Postgres database.
