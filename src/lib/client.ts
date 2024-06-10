import { Observable } from 'rxjs';
import { ClientBase } from './client-base.js';
import { ClientConfig, isClient } from './types.js';

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
