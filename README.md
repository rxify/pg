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

`pg-runner` is a lightweight alternative to Postgres IDEs.
It provides developers with the ability to run SQL scripts and queries
directly from their VSCode terminal.

### Options

| Option      | Alias | Description                                         |
| ----------- | ----- | --------------------------------------------------- |
| `--script`  | `-s`  | Execute a script wrapped in double quotes.          |
| `--path`    | `-p`  | Provide a path to a local `.sql` script to execute. |
| `--format`  | `-f`  | The format of the results printed to the console.   |
| `--values`  | `-v`  | Provide dynamic values.                             |
| `--cursors` |       | Flag indicating that `-s` or `-p` returns cursors.  |
| `--psql`    |       | Opens a psql session.                               |

### Examples

#### `--script`

```bash
$ pg-runner --script "SELECT * FROM my_table"
SELECT RETURNED n rows.
┌─────────┬────────────┬───────────┬──────────┐
│ (index) │  column_a  │ column_b  │ column_n │
├─────────┼────────────┼───────────┼──────────┤
│    1    │  'aa_val'  │ 'ab_val'  │ 'an_val' │
│    2    │  'ba_val'  │ 'bb_val'  │ 'bn_val' │
│    n    │  'na_val'  │ 'nb_val'  │ 'nn_val' │
└─────────┴────────────┴───────────┴──────────┘
```

#### `--path`

```bash
$ pg-runner --path "./my-script.sql"
SELECT RETURNED n rows.
┌─────────┬────────────┬───────────┬──────────┐
│ (index) │  column_a  │ column_b  │ column_n │
├─────────┼────────────┼───────────┼──────────┤
│    1    │  'aa_val'  │ 'ab_val'  │ 'an_val' │
│    2    │  'ba_val'  │ 'bb_val'  │ 'bn_val' │
│    n    │  'na_val'  │ 'nb_val'  │ 'nn_val' │
└─────────┴────────────┴───────────┴──────────┘
```

#### `--cursors`

When you include the `--cursors` flag, the `pg-runner` assums
that the query's initial result set is the cursors.
It then calls `FETCH ALL` on each cursor returned by the initial query.

```bash
$ sql-runner --script "SELECT * FROM get_all_users()" --cursors
```

#### `--values`

For scripts that accept arguments, you pass parameters with the
`--values` option, which accepts a list of space-separated values:

```bash
$ sql-runner --script "SELECT * FROM get_user_by_lastname(\$1)" --values Smith
$ sql-runner --script "SELECT * FROM get_user_by_lastname_firstname(\$1, \$2)" --values Smith John
```

It is important to note that you must escape the parameters; for example,
do not enter `"$1"`, enter `"\$1"`.

### Installation

You can use `pg-runner` globally by running the following command:

```bash
$ npm install -g @rxifyjs/pg
```

If you only want to use `pg-runner` in your application, you can run...

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
