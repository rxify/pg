import { Observable } from 'rxjs';
import { ClientBase } from './client-base.js';
import { ClientConfig, isClient } from './types.js';

/**
 * The RxJS wrapper for `pg.Client`.
 *
 * @extends ClientBase
 *
 * @example
 * // Query a database with client
 * new Client()
 *      .connect()
 *      .pipe(
 *          concatMap((client) =>
 *              client.query(`SELECT * FROM my_table`).pipe(concatMap(client.end))
 *          )
 *      )
 *      .subscribe({
 *          next: (result) => {
 *              console.log(
 *                  `Query succeeded. Returned ${result.rows.length} rows.`
 *              );
 *              console.table(result.rows);
 *          },
 *          error: (err) => {
 *              console.error('Query failed:');
 *              console.error(err);
 *          }
 *      });
 *
 * @example
 * // Stream rows from a client query
 * new Client(testDbParams)
 *      .connect()
 *      .pipe(
 *          concatMap((client) =>
 *              client
 *                  .stream(sql`SELECT * FROM get_animals()`)
 *                  // Use finalize to end the connection after all rows are returned
 *                  .pipe(finalize(() => client.end().subscribe()))
 *              )
 *      )
 *      .subscribe({
 *          next: (val) => {
 *              // Emits individual rows
 *          },
 *          complete: () => {
 *              // Complete is called when all rows have been read
 *          }
 *      });
 *
 * @publicApi
 */
export class Client extends ClientBase {
    constructor(config?: string | ClientConfig) {
        super(config);
    }

    /**
     * Closes a connection opened in `connect()` and forwards
     * the result of a successful query.
     * @param result The result of a successful query, useful for
     * RxJS maps.
     */
    end<T>(result: T): Observable<T>;

    /**
     * Closes a connection opened in `connect()`.
     */
    end(): Observable<this>;

    end<T>(results?: T) {
        return new Observable<T | this>((subscriber) => {
            if (isClient(this._clientNative)) {
                this._clientNative
                    .end()
                    .then(() => {
                        subscriber.next(results ?? this);
                        subscriber.complete();
                    })
                    .catch((reason) => subscriber.error(reason));
            } else {
                subscriber.error('Expected client, recieved pool client.');
            }
        });
    }
}
