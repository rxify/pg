import pg from 'pg';
import { Observable, concatMap, map, mergeMap } from 'rxjs';
import { stream } from './stream.js';
import { CustomTypesConfig, QueryConfigValues, QueryResult } from './types.js';
import { isNativeError } from 'util/types';

/**
 * Streams data from a query that returns cursors.
 * @param client A connected `Client` or `PoolClient`
 * @param config Defines streaming configuration.
 * @returns Rows associated with the cursor that reads them as
 * they are read.
 *
 * @publicApi
 */
export const streamCursorQuery = <I = any[]>(
    client: pg.Client | pg.PoolClient,
    config: {
        text: string;
        values?: QueryConfigValues<I>;
        types?: CustomTypesConfig;
        batchSize?: number;
        highWaterMark?: number;
        rowMode?: 'array';
    }
) => {
    const begin = new Observable<QueryResult<any>>((subscriber) => {
        client
            .query('BEGIN')
            .then((queryRes) => {
                subscriber.next(queryRes);
                subscriber.complete();
            })
            .catch((reason) => {
                if (isNativeError(reason)) {
                    reason.message = 'Failed to open query. ' + reason.message;
                }

                throw reason;
            });
    });

    const query = new Observable<string>((subscriber) => {
        client
            .query({
                text: config.text,
                types: config.types,
                values: config.values
            })
            .then((response) => {
                const rows = response.rows;

                if (rows.length === 0) {
                    throw new Error('Query did not return any cursors.');
                }

                rows.forEach((row: object) => {
                    const cursorRow = Object.values(row);

                    if (cursorRow.length === 0) {
                        throw new Error('Query did not return any cursors.');
                    }

                    subscriber.next(cursorRow[0]);
                });

                subscriber.complete();
            });
    });

    const fetchCursorRows = (cursor: string) =>
        stream<any>(client, {
            text: `FETCH ALL FROM ${cursor}`,
            batchSize: config.batchSize,
            highWaterMark: config.highWaterMark,
            rowMode: config.rowMode,
            types: config.types,
            values: config.values
        }).pipe(
            map((value) => ({
                cursor,
                value
            }))
        );

    return begin.pipe(
        concatMap(() => query),
        mergeMap((cursor) => fetchCursorRows(cursor))
    );
};
