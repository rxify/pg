import { Observable, catchError, concatMap, last, of, scan, tap } from 'rxjs';

import { selectSqlCli } from '../cli/select-sql.js';
import { ClientConfig, QueryCursorResult, QueryResult } from '../lib/types.js';
import { Client } from '../public-api.js';
import chalk from 'chalk';

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
    const notices: string[] = [];

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
            catchError((err) => {
                return of({
                    cursor: err,
                    rows: [err]
                });
            }),
            scan((acc, val) => {
                acc[val.cursor] ??= [];
                acc[val.cursor].push(...val.rows);
                return acc;
            }, {} as Record<string, any[]>),
            last(),
            tap((result) => {
                let cursor: keyof typeof result;
                for (cursor in result) {
                    console.log(
                        `Cursor ${cursor} return ${result[cursor].length} rows.`
                    );
                    if (output === 'table') {
                        console.table(result[cursor]);
                    } else {
                        console.log(result[cursor]);
                    }
                }
            })
        );

    const executeQuery = (observable: Observable<QueryResult<any>>) =>
        observable.pipe(
            catchError((err) => {
                return of({
                    command: 'error',
                    rowCount: null,
                    rows: [err],
                    fields: []
                });
            }),
            tap((result) => {
                if (result.command === 'error') {
                    console.error(chalk.bold.red('\nQuery failed:\n'));
                    console.error(result.rows[0]);
                } else {
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
                }

                const divider = '─'.repeat(30);

                console.log();
                console.log(chalk.bold.blue(divider + ' Notices ' + divider));
                console.log(notices.join('\n\n'));
                console.log(chalk.bold.blue('─'.repeat(69)));
            })
        );

    const query = (client: Client) =>
        getQueryText().pipe(
            concatMap((opts) => {
                const { cursor_res, select_file } = opts;

                const formattedValues = (() => {
                    if (!Array.isArray(values)) return;

                    return values.map((value) => {
                        const _value = value.toLowerCase();
                        if (_value === 'null') return null;
                        const num = parseInt(value);
                        if (!isNaN(num)) return num;
                        if (_value === 'true' || _value === 'false')
                            return _value === 'true';
                        return value;
                    });
                })();

                if (cursor_res) {
                    return executeCursorQuery(
                        client.query({
                            text: select_file,
                            returnsCursors: true,
                            values: formattedValues
                        })
                    );
                }

                return executeQuery(
                    client.query({
                        text: select_file,
                        values: formattedValues
                    })
                );
            }),
            catchError((err) => {
                return of({
                    cursor: 'error',
                    values: err
                });
            }),
            concatMap((val) => client.end(val))
        );

    return new Client(config).connect().pipe(
        concatMap((client) => {
            client.onNotice.subscribe((notice) => {
                if (notice.message) notices.push(notice.message);
            });
            return query(client);
        })
    );
};
