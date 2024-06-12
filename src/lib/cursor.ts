import pg from 'pg';
import { Observable, concatMap, mergeMap } from 'rxjs';
import { isNativeError } from 'util/types';

import { QueryConfigValues, QueryCursorResult } from './types.js';

export const executeCursorQuery = <I = any[]>(
    client: pg.Client | pg.PoolClient,
    text: string,
    values?: QueryConfigValues<I>
) => {
    const begin = new Observable<pg.QueryResult<any>>((subscriber) => {
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
        client.query<any>(text, values).then((response) => {
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
        new Observable<QueryCursorResult>((subscriber) => {
            client
                .query(`FETCH ALL FROM ${cursor}`)
                .then((resultRow) => {
                    subscriber.next({
                        cursor,
                        ...resultRow
                    });
                    subscriber.complete();
                })
                .catch((reason) => subscriber.error(reason));
        });

    return begin.pipe(
        concatMap(() => query),
        mergeMap((cursor) => fetchCursorRows(cursor))
    );
};
