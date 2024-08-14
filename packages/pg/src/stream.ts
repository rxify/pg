import QueryStream from 'pg-query-stream';
import pg from 'pg';
import { Observable } from 'rxjs';
import { CustomTypesConfig, QueryConfigValues } from './types.js';

/**
 * Streams values from a query.
 * @param client A connected client
 * @param text A query string
 * @param values Values correlating to the query string
 * @param config A query stream configuration object
 *
 * @publicApi
 */
export function stream<T, I = any[]>(
    client: pg.Client | pg.PoolClient,
    config: {
        text: string;
        values?: QueryConfigValues<I>;
        types?: CustomTypesConfig;
        batchSize?: number;
        highWaterMark?: number;
        rowMode?: 'array';
    }
): Observable<T> {
    return new Observable<T>((subscriber) => {
        const query = new QueryStream(config.text, config.values, {
            types: config.types,
            batchSize: config.batchSize,
            highWaterMark: config.highWaterMark,
            rowMode: config.rowMode
        });
        const stream = client.query(query);
        stream
            .on('data', (row) => subscriber.next(row))
            .on('error', (err) => subscriber.error(err))
            .on('end', () => subscriber.complete())
            .on('close', () => subscriber.complete());
    });
}
