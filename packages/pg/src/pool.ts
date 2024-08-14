import pg from 'pg';
import { Observable, Subject } from 'rxjs';

import { PoolClient } from './pool-client.js';

/**
 * The RxJS wrapper for `pg.Pool`.
 *
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
 *
 * @publicApi
 */
export class Pool {
    private _poolNative: pg.Pool;

    constructor(config?: pg.PoolConfig) {
        this._poolNative = new pg.Pool(config);
    }

    get totalCount() {
        return this._poolNative.waitingCount;
    }

    get idleCount() {
        return this._poolNative.idleCount;
    }

    waitingCount() {
        return this._poolNative.waitingCount;
    }

    /**
     * Opens a database connection using the options
     * defined in the constructor.
     */
    connect() {
        return new Observable<{
            pool: Pool;
            client: PoolClient;
        }>((subscriber) => {
            this._poolNative
                .connect()
                .then((response) => {
                    subscriber.next({
                        pool: this,
                        client: new PoolClient(response)
                    });
                    subscriber.complete();
                })
                .catch((reason) => subscriber.error(reason));
        });
    }

    /**
     * Closes the connection pool.
     */
    end() {
        return new Observable<{
            totalCount: number;
            waitingCount: number;
        }>((subscriber) => {
            this._poolNative
                .end()
                .then(() => {
                    subscriber.next({
                        totalCount: this._poolNative.totalCount,
                        waitingCount: this._poolNative.waitingCount
                    });
                    subscriber.complete();
                })
                .catch((reason) => subscriber.error(reason));
        });
    }

    unsubscribe(
        eventName?: 'connect' | 'aquire' | 'error' | 'drain' | 'remove'
    ): this {
        if (eventName) {
            switch (eventName) {
                case 'connect':
                    this._connect?.unsubscribe();
                    return this;
                case 'aquire':
                    this._aquire?.unsubscribe();
                    return this;
                case 'error':
                    this._error?.unsubscribe();
                    return this;
                case 'drain':
                    this._release?.unsubscribe();
                    return this;
                case 'remove':
                    this._remove?.unsubscribe();
                    return this;
            }
        }

        this._connect?.unsubscribe();
        this._aquire?.unsubscribe();
        this._error?.unsubscribe();
        this._remove?.unsubscribe();
        this._release?.unsubscribe();

        return this;
    }

    private _connect?: Subject<PoolClient>;
    public get onConnect(): Subject<PoolClient> {
        if (this._connect) return this._connect;
        this._connect = new Subject();
        this._poolNative.on('connect', (client) =>
            this._connect?.next(new PoolClient(client))
        );
        return this._connect;
    }

    private _aquire?: Subject<PoolClient>;
    public get onAquire(): Subject<PoolClient> {
        if (this._aquire) return this._aquire;
        this._aquire = new Subject();
        this._poolNative.on('acquire', (pool) =>
            this._aquire?.next(new PoolClient(pool))
        );
        return this._aquire;
    }

    private _remove?: Subject<PoolClient>;
    public get onRemove(): Subject<PoolClient> {
        if (this._remove) return this._remove;
        this._remove = new Subject();
        this._poolNative.on('remove', (pool) =>
            this._remove?.next(new PoolClient(pool))
        );
        return this._remove;
    }

    private _error?: Subject<Error>;
    public get onError(): Subject<Error> {
        if (this._error) return this._error;
        this._error = new Subject();
        this._poolNative.on('error', (error) => this._error?.next(error));
        return this._error;
    }

    private _release?: Subject<Error>;
    public get onRelease(): Subject<Error> {
        if (this._release) return this._release;
        this._release = new Subject();
        this._poolNative.on('release', (error) => this._release?.next(error));
        return this._release;
    }
}
