import pg from 'pg';
import { ClientBase } from './client-base.js';
import { Observable } from 'rxjs';
import { isPoolClient } from './types.js';

/**
 * The RxJS wrapper for `pg.Pool`.
 * @example
 * // Create a connection pool
 * const pool = new Pool();
 *
 * @example
 * // Open a connection and query the database
 *
 * pool.connect()
 *      .pipe(
 *          concatMap((val) => {
 *              const { poolClient } = val;
 *
 *              return poolClient
 *                  .query(sql`SELECT * FROM animals`)
 *                  .pipe(concatMap((result) => poolClient.release(result)));
 *              }
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
 *
 * @example
 *
 * // Open a connection and stream from the database
 * pool
 *      .connect()
 *      .pipe(
 *          concatMap((poolClient) => {
 *              const { poolClient } = val;
 *
 *              poolClient
 *                  .stream(sql`SELECT * FROM get_animals()`)
 *                  // Use finalize to release the pool connection after all rows are returned
 *                  .pipe(finalize(() => poolClient.release().subscribe()))
 *          })
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
 * @example
 *
 * // Close a connection pool
 * pool.end().subscribe()
 */
export class PoolClient extends ClientBase {
    constructor(config: pg.PoolClient) {
        super(config);
    }

    /**
     * Releases a connection opened in `connect()` and forwards
     * the result of a successful query.
     * @param result The result of a successful query, useful for
     * RxJS maps.
     */
    release<T>(result: T): Observable<T>;

    /**
     * Releases a connection opened in `connect()`.
     */
    release(): Observable<this>;

    release<T>(result?: T) {
        return new Observable((subscriber) => {
            if (isPoolClient(this._clientNative)) {
                try {
                    this._clientNative.release(true);
                    subscriber.next(result ?? this);
                    subscriber.complete();
                } catch (e) {
                    subscriber.error(e);
                }
            } else {
                subscriber.error('Expected a pool client, received a client.');
            }
        });
    }
}
