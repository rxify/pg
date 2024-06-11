import QueryStream from 'pg-query-stream';
import pg from 'pg';
import { Observable } from 'rxjs';
import { QueryStreamConfig } from './types.js';

/**
 * Streams values from a query.
 * @param client A connected client
 * @param text A query string
 * @param values Values correlating to the query string
 * @param config A query stream configuration object
 *
 * @publicApi
 */
export function stream<T>(
    client: pg.Client | pg.PoolClient,
    text: string,
    values?: any[],
    config?: QueryStreamConfig
): Observable<T> {
    return new Observable<T>((subscriber) => {
        const query = new QueryStream(text, values, config);
        const stream = client.query(query);
        stream
            .on('data', (row) => subscriber.next(row))
            .on('error', (err) => subscriber.error(err))
            .on('end', () => subscriber.complete())
            .on('close', () => subscriber.complete());
    });
}
