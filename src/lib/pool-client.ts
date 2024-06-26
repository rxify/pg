import pg from 'pg';
import { ClientBase } from './client-base.js';
import { Observable } from 'rxjs';
import { isPgPoolClient, isTruthy } from './types.js';

/** Safely assert that `val` is a `PoolClient`. */
export const isPoolClient = (val: any): val is PoolClient => {
    try {
        return isTruthy(val) && 'release' in val;
    } catch {
        return false;
    }
};

/**
 * The RxJS wrapper for `pg.PoolClient`.
 *
 * @extends ClientBase
 *
 * @note A `PoolClient` is created automatically when `connect` is called
 * from within `Pool`. This class is nearly identical to `Client`,
 * except `Client`, except a standalone client is disconnected with `end()`,
 * whereas a `PoolClient` is _released_ with `release()`.
 *
 * @publicApi
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
            if (isPgPoolClient(this._clientNative)) {
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
