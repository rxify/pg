# @rxifyjs/pg

Provides [RxJS](https://www.npmjs.com/package/rxjs) wrappers for
[node-postgres](https://www.npmjs.com/package/pg).

We have attempted to create wrappers for most of the functionality that is
required for the middle tier of an application, including
connection pooling, cursors, query streaming, and one-off client creation.

If you identify a missing features or bug,
[open a PR](https://github.com/rxify/pg/pulls) or submit
[a feature request or bug report](https://github.com/rxify/pg/issues).

For detailed documentation, visit [our GitHub page](https://rxify.github.io/pg/).

## Testing

This library uses the [`@databases/pg`](https://www.atdatabases.org/docs/pg-test)
library to test. Before testing, you need to run the following commands to
start and initialize the test database:

```bash
npm run db:start
npm run db:init
```

This will spin up a docker database instance and run an init script that creates
test tables, inserts their data, and creates test functions.

### Note on Unit Testing

When we implemented the
[Jest hooks outlined in the `@databases/pg` docs](https://www.atdatabases.org/docs/pg-test#jest),
we ran into an issue where the database is spun down before tests complete.
While we're working on fixing this issue, run the following command
before running unit tests:

```
npm run db:start
```

After tests have completed, run...

```
npm run db:stop
```

These commands will spin up and spin down a test Postgres database.
