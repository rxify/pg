import pg from 'pg';
import { Observable, Subject, take } from 'rxjs';
import type {
    QueryConfig,
    QueryResult,
    QueryResultRow,
    Notification,
    QueryStreamConfig,
    ClientConfig,
    QueryCursorResult,
    QueryCursorRow
} from './types.js';
import { isPgClient, isPgPoolClient, isTruthy } from './types.js';
import { NoticeMessage } from 'pg-protocol/dist/messages.js';
import { stream } from './stream.js';
import { executeCursorQuery } from './cursor.js';
import { streamCursorQuery } from './stream-cursor.js';

/**
 * @param text A query string or a function name
 * @param schema The schema to which the function belongs
 * @param values The function's arguments
 * @returns Text formatted as a function with the arguments referenced dynamically,
 * and the arguments parsed.
 */
export const formatFunction = (
    text: string,
    schema?: string,
    values?: any[]
) => {
    let parsedValues = values
        ?.map((val) => {
            if (val === undefined || val === null) return null;
            const asNum = parseInt(val);
            if (!isNaN(asNum)) return asNum;
            if (val === 'true' || val === 'false') return val === 'true';
            return val;
        })
        .filter(isTruthy);

    // Add the select statement to the function name
    // if it is not in the text
    if (!text.toLowerCase().includes('select')) {
        text = 'SELECT * FROM ' + schema + '.' + text;
    }

    // If the text ends with a close paren, the user has completed
    // the function call, so we should return
    if (text.endsWith(')')) {
        return {
            text,
            values: parsedValues
        };
    }

    // Add the opening paren if it is not in the text
    if (!text.includes('(')) {
        text += '(';
    }

    // If there are values, add the references
    if (values && values.length > 0) {
        let refIndex = 1;

        const args = [...values].map((arg, index) => {
            if (arg !== null && arg !== undefined) return `$${refIndex++}`;
            values.splice(index, 1);
            return 'NULL';
        });

        text += args.join(',');
    }

    text += ')';

    return {
        text,
        values: parsedValues
    };
};

/**
 * Defines the base functionality for clients.
 */
export class ClientBase {
    protected _clientNative: pg.Client | pg.PoolClient;

    constructor(config?: string | ClientConfig | pg.PoolClient) {
        if (isPgClient(config) || isPgPoolClient(config)) {
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
     * Queries a database, returning query results after
     * all results have been returned.
     * @param config Defines query parameters
     */
    query<T extends QueryResultRow = any, I = any[]>(
        config: QueryConfig<I> & {
            returnsCursors?: false;
            stream?: false;
        }
    ): Observable<QueryResult<T>>;

    /**
     * Queries a database, streaming query results as
     * they are read.
     * @param config Defines query parameters
     */
    query<T = any, I = any[]>(
        config: QueryConfig<I> &
            QueryStreamConfig & {
                returnsCursors?: false;
                stream: true;
            }
    ): Observable<T>;

    /**
     * Queries a database, returning query results by cursor
     * after cursor has read all rows.
     * @param config Defines query parameters
     */
    query<I = any[]>(
        config: QueryConfig<I> & {
            returnsCursors: true;
            stream?: false;
        }
    ): Observable<QueryCursorResult>;

    /**
     * Queries a database, streaming query results as
     * cursor reads rows.
     * @param config Defines query parameters
     */
    query<I = any[]>(
        config: QueryConfig<I> &
            QueryStreamConfig & {
                returnsCursors: true;
                stream: true;
            }
    ): Observable<QueryCursorRow>;

    query(
        config: QueryConfig<any> &
            QueryStreamConfig & {
                returnsCursors?: boolean;
                stream?: boolean;
            }
    ): Observable<any> {
        const { text, values } = config.isFunction
            ? formatFunction(config.text, config.schema, config.values)
            : config;

        const streamOpts: QueryStreamConfig = {
            highWaterMark: config.highWaterMark,
            rowMode: config.rowMode,
            types: config.types,
            batchSize: config.batchSize
        };

        // The query returns cursors
        if (config.returnsCursors) {
            // And the user specified to stream the query results
            if (config.stream) {
                return streamCursorQuery(this._clientNative, {
                    text,
                    values,
                    ...streamOpts
                });
            }

            // And the user specified to return the query results
            return executeCursorQuery(this._clientNative, text, values);
        }

        // The query does not return cursors, and the user
        // specified to stream the results
        if (config.stream) {
            return stream<any>(this._clientNative, {
                text,
                values,
                ...streamOpts
            });
        }

        this._logQueryDebug(text, values);

        // The query does not return cursors, and the user
        // did not specify to stream the results
        return new Observable<any>((subscriber) => {
            this._clientNative
                .query(text, values)
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
     * Formats the parameters of a sql request for printing.
     * @param poolConfig Pg pool configuration
     * for instances where the pool does not exist.
     * @param querSt A postgres query
     * @param values Values mapped to `queryString`
     */
    // @ts-ignore
    private _logQueryDebug(querSt: string, values: any[] = []) {
        // console.info(`Querying:`);
        // const _vals_ = values
        //     .map((val) => (val === undefined ? 'undefined' : val))
        //     .join(',');
        // const queryStringLen = querSt.length;
        // const valuesLen = _vals_.length;
        // const longest = queryStringLen > valuesLen ? queryStringLen : valuesLen;
        // const vals_pad = ' '.repeat(longest - valuesLen);
        // const _qs_pad_ = ' '.repeat(longest - queryStringLen);
        // const length = '─'.repeat(longest);
        // const query = highlight(querSt);
        // const g = chalk.gray;
        // console.log(g('┌────────┬─' + length + '─┐'));
        // console.log(g('│') + ' Query  ' + g('│ ') + query + _qs_pad_ + g(' │'));
        // console.log(
        //     g('│') + ' Values ' + g('│ ') + _vals_ + vals_pad + g(' │')
        // );
        // console.log(g('└────────┴─' + length + '─┘'));
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
