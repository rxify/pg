import pg from 'pg';
import { ClientBase } from './client-base.js';
import { Observable } from 'rxjs';
import { isPoolClient } from './types.js';

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