# `@rxify/pg`

Provides RxJS wrappers for [node-postgres](https://www.npmjs.com/package/pg).

We've attempted to implement the core feature set of `node-postgres`, including...

-   Client

    -   `connect(): Observable<void>`
    -   `end(): Observable<void>`
    -   `query`:

        -   ```typescript
            query<R extends any[] = any[], I = any[]>(
                queryConfig: QueryArrayConfig<I>,
                values?: QueryConfigValues<I>
            ): Observable<QueryArrayResult<R>>;
            ```
        -   ```typescript
            query<R extends QueryResultRow = any, I = any>(
             queryConfig: QueryConfig<I>
            ): Observable<QueryResult<R>>;
            ```
        -   ```typescript
            query<R extends QueryResultRow = any, I = any[]>(
                queryTextOrConfig: string | QueryConfig<I>,
                values?: QueryConfigValues<I> | undefined
            ): Observable<QueryResult<R>>;
            ```

-   Pool
-   QueryStream

If you identify any missing features or identify bugs,
[open a PR](https://github.com/rxify/pg/pulls) or submit
[a feature request or bug report](https://github.com/rxify/pg/issues).

## Note on Testing

This library uses the [`@databases/pg`](https://www.atdatabases.org/docs/pg-test)
library to test. When we implemented the
[Jest hooks outlined in their docs](https://www.atdatabases.org/docs/pg-test#jest),
we ran into an issue where the database is closed before tests complete.
While we're working on implementing the Jest hooks, run the following command
before running tests:

```
npm run db:start
```

After tests have completed, execute...

```
npm run db:stop
```

These commands will spin up and spin down a test Postgres database.
