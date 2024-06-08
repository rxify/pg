import pg from 'pg';
import { Observable, Subject } from 'rxjs';
import {
    PoolClient,
    QueryArrayConfig,
    QueryArrayResult,
    QueryConfig,
    QueryConfigValues,
    QueryResult,
    QueryResultRow,
    QueryStreamConfig,
    isQueryArrayConfig,
    isQueryConfig
} from './types.js';
import QueryStream from 'pg-query-stream';

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

    connect(): Observable<PoolClient> {
        return new Observable<PoolClient>((subscriber) => {
            this._poolNative
                .connect()
                .then((response) => {
                    subscriber.next(response);
                    subscriber.complete();
                })
                .catch((reason) => subscriber.error(reason));
        });
    }

    stream<T>(
        client: pg.Client,
        text: string,
        values?: any[],
        config?: QueryStreamConfig
    ): Observable<T> {
        return new Observable<T>((subscriber) => {
            const query = new QueryStream(text, values, config);
            const stream = client.query(query);
            stream
                .on('data', (row) => {
                    subscriber.next(row);
                })
                .on('error', (err) => {
                    subscriber.error(err);
                })
                .on('end', () => {
                    subscriber.complete();
                })
                .on('close', () => {
                    subscriber.complete();
                });
        });
    }

    end() {
        return new Observable<void>((subscriber) => {
            this._poolNative
                .end()
                .then(() => subscriber.complete())
                .catch((reason) => subscriber.error(reason));
        });
    }

    query<T extends any[] = any[], I = any[]>(
        queryConfig: QueryArrayConfig<I>,
        values?: QueryConfigValues<I> | undefined
    ): Observable<QueryArrayResult<T>>;

    query<T extends QueryResultRow = any, I = any>(
        queryConfig: QueryConfig<I>
    ): Observable<QueryResult<T>>;

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
                return this._poolNative.query(queryText, values);
            if (isQueryArrayConfig(queryText))
                return this._poolNative.query(queryText, values);

            return this._poolNative.query(queryText, values);
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
        this._poolNative.on('connect', (client: PoolClient) =>
            this._connect?.next(client)
        );
        return this._connect;
    }

    private _aquire?: Subject<PoolClient>;
    public get onAquire(): Subject<PoolClient> {
        if (this._aquire) return this._aquire;
        this._aquire = new Subject();
        this._poolNative.on('acquire', (pool) => this._aquire?.next(pool));
        return this._aquire;
    }

    private _remove?: Subject<PoolClient>;
    public get onRemove(): Subject<PoolClient> {
        if (this._remove) return this._remove;
        this._remove = new Subject();
        this._poolNative.on('remove', (client: PoolClient) =>
            this._remove?.next(client)
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
