## CLI

`@rxpg/cli` is a lightweight alternative to Postgres IDEs.
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
$ rxpg --script "SELECT * FROM my_table"
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
$ rxpg --path "./my-script.sql"
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

When you include the `--cursors` flag, the `rxpg` assums
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

You can use `rxpg` globally by running the following command:

```bash
$ npm install -g @rxifyjs/pg
```

If you only want to use `rxpg` in your application, you can run...

```bash
$ npm install --save @rxifyjs/pg
$ npx rxpg ...
```
