# `@rxify/pg`

Provides RxJS wrappers for [node-postgres](https://www.npmjs.com/package/pg).
If you identify any missing features or identify bugs,
[open a PR](https://github.com/rxify/pg/pulls) or submit
[a feature request or bug report](https://github.com/rxify/pg/issues).

## API

The following are common between `Client` and `Pool`.

| Method           | Description                                                     | Returns                                                                                               |
| ---------------- | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `connect`        | Opens database connection.                                      | Observable<ClientDetails>                                                                             |
| `end`            | Ends database connection.                                       | Observable<ClientDetails>                                                                             |
| `query`          | Queries connected database.                                     | `Observable<QueryResult>`<br>`Observable<QueryArrayResult>`                                           |
| `once`           | Subscribes to events that complete after one event is observed. | `Observable<void>`<br>`Observable<Error>`<br>`Observable<NoticeMessage>`<br>`Observable<Noticiation>` |
| `unsubscribe`    | Unsubscribes from event subjects.                               | `this`                                                                                                |
| `onDrain`        | Subscribes to `drain` events.                                   | `Subject<void>`                                                                                       |
| `onEnd`          | Subscribes to `end` events.                                     | `Subject<void>`                                                                                       |
| `onError`        | Subscribes to `error` events.                                   | `Subject<Error>`                                                                                      |
| `onNotice`       | Subscribes to `notice` events.                                  | `Subject<NoticeMessage>`                                                                              |
| `onNotification` | Subscribes to `notification` events.                            | `Subject<Notification>`                                                                               |

## Examples

### Query a Database Table

```typescript
new Client()
    .connect()
    .pipe(
        concatMap((client) =>
            client.query(`SELECT * FROM my_table`).pipe(concatMap(client.end))
        )
    )
    .subscribe({
        next: (result) => {
            console.log(
                `Query succeeded. Returned ${result.rows.length} rows.`
            );
            console.table(result.rows);
        },
        error: (err) => {
            console.error('Query failed:');
            console.error(err);
        }
    });
```

## Testing

This library uses the [`@databases/pg`](https://www.atdatabases.org/docs/pg-test)
library to test. Before testing, you need to run the following commands to
start the test database and initialize the database:

```bash
npm run db:start
npm run db:init
```

This will spin up a docker database instance and run an init script that creates
test tables, inserts their data, and creates test functions.

### Unit Tests

When we implemented the
[Jest hooks outlined in the `@databases/pg` docs](https://www.atdatabases.org/docs/pg-test#jest),
we ran into an issue where the database is spun down before tests complete.
While we're working on fixing this issue, run the following command
before running tests:

```
npm run db:start
```

After tests have completed, run...

```
npm run db:stop
```

These commands will spin up and spin down a test Postgres database.
