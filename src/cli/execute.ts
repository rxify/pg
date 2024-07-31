import { Observable, catchError, concatMap, last, map, of, scan } from 'rxjs';
import { exit } from 'process';
import chalk from 'chalk';

import { Client } from '../lib/client.js';
import { ClientConfig, QueryCursorResult, QueryResult } from '../lib/types.js';
import { prettyPrintPgError } from './error.js';

export declare type QueryText = {
    cursor_res?: boolean;
    text: string;
};

export declare type QueryResponse = {
    message: string;
    results: any[];
    fields?: any[];
};

export class Query {
    private notices: string[] = [];

    /**
     * Executes a query.
     * @param client A pool client for `psql` or a standalone client for one-off requests.
     * @param text Query text
     * @param cursors Whether `script` or `path` returns cursors
     * @param output Whether query results should be printed to the console
     * as a JSON object or as a table. Defaults to `table`.
     */
    constructor(
        public config: ClientConfig,
        public text?: string,
        public path?: string,
        public cursors: boolean = false,
        public output: 'table' | 'json' = 'table',
        public values?: string[]
    ) {}

    public execute() {
        const command = (() => {
            const text = this.text;
            if (!text) {
                console.error(
                    chalk.red(
                        'You must provide a valid commend.' +
                            ' Run --help for more information.'
                    )
                );
                exit();
            }
            return of({
                cursor_res: this.cursors,
                text
            });
        })();

        return command.pipe(
            concatMap((opts) => this._switch(opts)),
            catchError((error) => {
                console.error('Query failed');
                prettyPrintPgError(error, this.text, this.path);
                exit();
            }),
            map(({ results, notices }) => {
                results.forEach((result) => {
                    console.log(result.message);
                    if (this.output === 'json') {
                        console.log(JSON.stringify(result.results));
                    } else {
                        console.table(
                            result.results,
                            result.fields?.map((field) => field.name)
                        );
                    }
                });

                if (notices.length > 0) {
                    const divider = '─'.repeat(30);
                    console.log();
                    console.log(
                        chalk.bold.blue(divider + ' Notices ' + divider)
                    );
                    console.log(this.notices.join('\n\n'));
                    console.log(chalk.bold.blue('─'.repeat(69)));
                }

                return 'QUERY SUCCESS';
            })
        );
    }

    private _switch(opts: QueryText) {
        const { cursor_res, text } = opts;

        const formattedValues = (() => {
            if (!Array.isArray(this.values)) return;

            return this.values.map((value) => {
                const _value = value.toLowerCase();
                if (_value === 'null') return null;
                const num = parseInt(value);
                if (!isNaN(num)) return num;
                if (_value === 'true' || _value === 'false')
                    return _value === 'true';
                return value;
            });
        })();

        const select = (client: Client) => {
            if (cursor_res) {
                return this._executeCursor(
                    client.query({
                        text: text,
                        returnsCursors: true,
                        values: formattedValues
                    })
                );
            }

            return this._execute(
                client.query({
                    text: text,
                    values: formattedValues
                })
            );
        };

        return new Client(this.config).connect().pipe(
            concatMap((client) => {
                const notices: string[] = [];

                client.onNotice.subscribe((notice) => {
                    if (notice.message) notices.push(notice.message);
                });

                return select(client).pipe(
                    concatMap((results) => {
                        return client.end({
                            results,
                            notices
                        });
                    })
                );
            })
        );
    }

    private _executeCursor(
        observable: Observable<QueryCursorResult>
    ): Observable<QueryResponse[]> {
        return observable.pipe(
            scan((acc, val) => {
                acc[val.cursor] ??= [];
                acc[val.cursor].push(...(val.rows ?? []));
                return acc;
            }, {} as Record<string, any[]>),
            last(),
            map((result) => {
                return Object.entries(result).map(
                    ([key, val]): QueryResponse => {
                        return {
                            message: `Cursor ${key} returned ${result[key].length} rows.`,
                            results: val
                        };
                    }
                );
            })
        );
    }

    private _execute(
        observable: Observable<QueryResult<any>>
    ): Observable<QueryResponse[]> {
        return observable.pipe(
            map((result) => {
                if (Array.isArray(result)) {
                    return result.map((result) => {
                        return {
                            message: `${result.command} returned ${result.rowCount} rows.`,
                            results: result.rows
                        };
                    });
                }

                return [
                    {
                        message: `${result.command} returned ${result.rowCount} rows.`,
                        results: result.rows
                    }
                ];
            })
        );
    }
}
