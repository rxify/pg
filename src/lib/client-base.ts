import pg from 'pg';
import { Observable, Subject, take } from 'rxjs';
import type {
    QueryArrayConfig,
    QueryArrayResult,
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow,
    Notification,
    QueryStreamConfig,
    ClientConfig
} from './types.js';
import {
    isClient,
    isPoolClient,
    isQueryArrayConfig,
    isQueryConfig
} from './types.js';
import { NoticeMessage } from 'pg-protocol/dist/messages.js';
import { stream } from './stream.js';

export class ClientBase {
    protected _clientNative: pg.Client | pg.PoolClient;

    constructor(config?: string | ClientConfig | pg.PoolClient) {
        if (isClient(config) || isPoolClient(config)) {
            this._clientNative = config;
        } else {
            this._clientNative = new pg.Client(config);
        }
    }

    /**
     * Opens a database connection using the options
     * defined in the constructor.
     */
    connect(): Observable<this> {
        return new Observable((subscriber) => {
            this._clientNative
                .connect()
                .then(() => {
                    subscriber.next(this);
                    subscriber.complete();
                })
                .catch((reason) => subscriber.error(reason));
        });
    }

    /**
     * Queries the database to which `Client` is connected.
     * @param queryConfig A query configuration object
     * @param values Dynamic values that correspond to the query
     * defined in `queryConfig`.
     */
    query<T extends any[] = any[], I = any[]>(
        queryConfig: QueryArrayConfig<I>,
        values?: QueryConfigValues<I> | undefined
    ): Observable<QueryArrayResult<T>>;

    /**
     * Queries the database to which `Client` is connected.
     * @param queryConfig A query configuration object
     */
    query<T extends QueryResultRow = any, I = any>(
        queryConfig: QueryConfig<I>
    ): Observable<QueryResult<T>>;

    /**
     * Queries the database to which `Client` is connected.
     * @param queryConfig A query configuration object or query string
     * @param values Dynamic values that correspond to the query
     * defined in `queryConfig`.
     */
    query<T extends QueryResultRow = any, I = any[]>(
        queryTextOrConfig: string | QueryConfig<I>,
        values?: QueryConfigValues<I> | undefined
    ): Observable<QueryResult<T>>;

    query(
        queryText: string | QueryConfig<any> | QueryArrayConfig<any>,
        values?: QueryConfigValues<any>
    ): Observable<any> {
        const selectQuery = () => {
            if (isQueryConfig(queryText))
                return this._clientNative.query(queryText, values);
            if (isQueryArrayConfig(queryText))
                return this._clientNative.query(queryText, values);

            return this._clientNative.query(queryText, values);
        };

        return new Observable<any>((subscriber) => {
            selectQuery()
                .then((result) => {
                    subscriber.next(result);
                    subscriber.complete();
                })
                .catch((reason) => {
                    subscriber.error(reason);
                });
        });
    }

    /**
     * Streams values from a query.
     * @param text A query string
     * @param values Values correlating to the query string
     * @param config A query stream configuration object
     */
    public stream<T = any>(
        text: string,
        values?: any[],
        config?: QueryStreamConfig
    ) {
        return stream<T>(this._clientNative, text, values, config);
    }

    /**
     * Completes after one `drain` event has been observed.
     */
    once(eventName: 'drain'): Observable<void>;

    /**
     * Completes after one `end` event has been observed.
     */
    once(eventName: 'end'): Observable<void>;

    /**
     * Completes after one `error` has been observed.
     */
    once(eventName: 'error'): Observable<Error>;

    /**
     * Completes after one `NoticeMessage` has been observed.
     */
    once(eventName: 'notice'): Observable<NoticeMessage>;

    /**
     * Completes after one `Notification` has been observed.
     */
    once(eventName: 'notification'): Observable<Notification>;

    once(
        eventName: 'drain' | 'end' | 'error' | 'notice' | 'notification'
    ): Observable<any> {
        switch (eventName) {
            case 'drain':
                return this.onDrain.pipe(take(1));
            case 'end':
                return this.onEnd.pipe(take(1));
            case 'error':
                return this.onError.pipe(take(1));
            case 'notice':
                return this.onNotice.pipe(take(1));
            case 'notification':
                return this.onNotification.pipe(take(1));
        }
    }

    /**
     * Unsubscribes from an event subject or all event subjects.
     * @param eventName A `Client` event name
     */
    unsubscribe(
        eventName?: 'drain' | 'end' | 'error' | 'notice' | 'notification'
    ): this {
        if (eventName) {
            this._clientNative.removeAllListeners(eventName);
            switch (eventName) {
                case 'drain':
                    this._drain?.unsubscribe();
                    return this;
                case 'end':
                    this._end?.unsubscribe();
                    return this;
                case 'error':
                    this._error?.unsubscribe();
                    return this;
                case 'notice':
                    this._notice?.unsubscribe();
                    return this;
                case 'notification':
                    this._notification?.unsubscribe();
                    return this;
            }
        }

        this._clientNative.removeAllListeners();
        this._drain?.unsubscribe();
        this._end?.unsubscribe();
        this._error?.unsubscribe();
        this._notice?.unsubscribe();
        this._notification?.unsubscribe();

        return this;
    }

    /**
     * A Subject that emits `drain` events.
     */
    public get onDrain(): Subject<void> {
        if (this._drain) return this._drain;
        this._drain = new Subject();
        this._clientNative.on('drain', () => this._drain?.next());
        return this._drain;
    }
    private _drain?: Subject<void>;

    /**
     * A Subject that emits `end` events.
     */
    public get onEnd(): Subject<void> {
        if (this._end) return this._end;
        this._end = new Subject();
        this._clientNative.on('end', () => this._end?.next());
        return this._end;
    }
    private _end?: Subject<void>;

    /**
     * A Subject that emits `error` events.
     */
    public get onError(): Subject<Error> {
        if (this._error) return this._error;
        this._error = new Subject();
        this._clientNative.on('error', (error) => this._error?.next(error));
        return this._error;
    }
    private _error?: Subject<Error>;

    /**
     * A Subject that emits `notice` events.
     */
    public get onNotice(): Subject<NoticeMessage> {
        if (this._notice) return this._notice;
        this._notice = new Subject();
        this._clientNative.on('notice', (notice) => this._notice?.next(notice));
        return this._notice;
    }
    private _notice?: Subject<NoticeMessage>;

    /**
     * A Subject that emits `notification` events.
     */
    public get onNotification(): Subject<Notification> {
        if (this._notification) return this._notification;
        this._notification = new Subject();
        this._clientNative.on('notification', (notice) =>
            this._notification?.next(notice)
        );
        return this._notification;
    }
    private _notification?: Subject<Notification>;
}
