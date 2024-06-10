import pg from 'pg';
import { Observable, Subject, take } from 'rxjs';
import type {
    QueryArrayConfig,
    QueryArrayResult,
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow,
    Notification
} from './types.js';
import { isQueryArrayConfig, isQueryConfig } from './types.js';
import { NoticeMessage } from 'pg-protocol/dist/messages.js';

declare type ClientDetails = {
    host: string;
    port: number;
    database?: string | undefined;
};

export class Client {
    protected _clientNative: pg.Client;

    constructor(config?: string | pg.ClientConfig | undefined) {
        this._clientNative = new pg.Client(config);
    }

    get details(): ClientDetails {
        return {
            host: this._clientNative.host,
            port: this._clientNative.port,
            database: this._clientNative.database
        };
    }

    connect(): Observable<ClientDetails> {
        return new Observable((subscriber) => {
            this._clientNative
                .connect()
                .then(() => {
                    subscriber.next(this.details);
                    subscriber.complete();
                })
                .catch((reason) => subscriber.error(reason));
        });
    }

    end() {
        return new Observable<ClientDetails>((subscriber) => {
            this._clientNative
                .end()
                .then(() => {
                    subscriber.next(this.details);
                    subscriber.complete();
                })
                .catch((reason) => subscriber.error(reason));
        });
    }

    query<R extends any[] = any[], I = any[]>(
        queryConfig: QueryArrayConfig<I>,
        values?: QueryConfigValues<I> | undefined
    ): Observable<QueryArrayResult<R>>;

    query<R extends QueryResultRow = any, I = any>(
        queryConfig: QueryConfig<I>
    ): Observable<QueryResult<R>>;

    query<R extends QueryResultRow = any, I = any[]>(
        queryTextOrConfig: string | QueryConfig<I>,
        values?: QueryConfigValues<I> | undefined
    ): Observable<QueryResult<R>>;

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

    once(eventName: 'drain'): Observable<void>;

    once(eventName: 'end'): Observable<void>;

    once(eventName: 'error'): Observable<Error>;

    once(eventName: 'notice'): Observable<NoticeMessage>;

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

    unsubscribe(
        eventName?: 'drain' | 'end' | 'error' | 'notice' | 'notification'
    ): this {
        if (eventName) {
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

        this._drain?.unsubscribe();
        this._end?.unsubscribe();
        this._error?.unsubscribe();
        this._notice?.unsubscribe();
        this._notification?.unsubscribe();

        return this;
    }

    private _drain?: Subject<void>;
    public get onDrain(): Subject<void> {
        if (this._drain) return this._drain;
        this._drain = new Subject();
        this._clientNative.on('drain', () => this._drain?.next());
        return this._drain;
    }

    private _end?: Subject<void>;
    public get onEnd(): Subject<void> {
        if (this._end) return this._end;
        this._end = new Subject();
        this._clientNative.on('end', () => this._end?.next());
        return this._end;
    }

    private _error?: Subject<Error>;
    public get onError(): Subject<Error> {
        if (this._error) return this._error;
        this._error = new Subject();
        this._clientNative.on('error', (error) => this._error?.next(error));
        return this._error;
    }

    private _notice?: Subject<NoticeMessage>;
    public get onNotice(): Subject<NoticeMessage> {
        if (this._notice) return this._notice;
        this._notice = new Subject();
        this._clientNative.on('notice', (notice) => this._notice?.next(notice));
        return this._notice;
    }

    private _notification?: Subject<Notification>;
    public get onNotification(): Subject<Notification> {
        if (this._notification) return this._notification;
        this._notification = new Subject();
        this._clientNative.on('notification', (notice) =>
            this._notification?.next(notice)
        );
        return this._notification;
    }
}
