import { Observable, concatMap, last, of, scan, tap } from 'rxjs';

import { selectSqlCli } from '../cli/select-sql.js';
import { ClientConfig, QueryCursorResult, QueryResult } from '../lib/types.js';
import { Client } from '../public-api.js';

/**
 * Executes a query.
 * @param client A pool client for `psql` or a standalone client for one-off requests.
 * @param text Query text
 * @param cursors Whether `script` or `path` returns cursors
 * @param output Whether query results should be printed to the console
 * as a JSON object or as a table. Defaults to `table`.
 * @returns The query results
 */
export const executeQuery = (
    config: ClientConfig,
    text?: string,
    cursors: boolean = false,
    output: 'table' | 'json' = 'table',
    values?: string[]
) => {
    const getQueryText = () => {
        if (text)
            return of({
                cursor_res: cursors,
                select_file: text
            });

        return selectSqlCli();
    };

    const executeCursorQuery = (observable: Observable<QueryCursorResult>) =>
        observable.pipe(
            scan((acc, val) => {
                acc[val.cursor] ??= [];
                acc[val.cursor].push(val);
                return acc;
            }, {} as Record<string, any[]>),
            last(),
            tap((result) => {
                let cursor: keyof typeof result;
                for (cursor in result) {
                    console.log(
                        `Cursor ${cursor} return ${result[cursor].length} rows.`
                    );
                    console.table(result[cursor]);
                }
            })
        );

    const executeQuery = (observable: Observable<QueryResult<any>>) =>
        observable.pipe(
            tap((result) => {
                console.log(
                    `${result.command} returned ${result.rowCount} rows.`
                );

                switch (output) {
                    case 'json':
                        console.log(JSON.stringify(result.rows));
                        break;
                    default:
                        console.table(
                            result.rows,
                            result.fields.map((field) => field.name)
                        );
                }
            })
        );

    const query = (client: Client) =>
        getQueryText().pipe(
            concatMap((opts) => {
                const { cursor_res, select_file } = opts;

                if (cursor_res) {
                    return executeCursorQuery(
                        client.query({
                            text: select_file,
                            returnsCursors: true,
                            values
                        })
                    );
                }

                return executeQuery(
                    client.query({
                        text: select_file,
                        values
                    })
                );
            }),
            concatMap((val) => client.end(val))
        );

    return new Client(config)
        .connect()
        .pipe(concatMap((client) => query(client)));
};
