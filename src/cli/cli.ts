import { concatMap } from 'rxjs';
import { dirname, join, resolve } from 'path';
import { existsSync, readFileSync } from 'fs';
import { exit } from 'process';
import { fileURLToPath } from 'url';
import { hideBin } from 'yargs/helpers';
import { isNativeError } from 'util/types';
import chalk from 'chalk';
import readline from 'node:readline';
import yargs from 'yargs';

import { Connection, PgRunnerConfig } from './config.js';
import { Query } from './execute.js';
import { isPgNativeError } from './error.js';

const appVerison = () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const root = join(dir, '..', 'package.json');
    if (existsSync(root)) {
        return JSON.parse(readFileSync(root, 'utf-8')).version as string;
    }

    return 'unknown';
};

const isPathLike = (val: string) => {
    return val.startsWith('/') || val.startsWith('./');
};

export const cli = yargs(hideBin(process.argv))
    .command(
        'exec <path|script>',
        'Execute a local .sql file given an absolute pathrelative' +
            'to the current directory or a SQL script wrapped in double-quotes.',
        (yargs) => {
            return yargs
                .completion()
                .positional('<path|script>', {
                    describe:
                        'The absolute path relative to the current directory' +
                        'or an SQL script wrapped in double-quotes.',
                    demandOption: 'path',
                    string: true
                })
                .options({
                    format: {
                        alias: 'f',
                        describe:
                            'The format of the results printed to the console.',
                        choices: ['table', 'json'],
                        default: 'table'
                    },
                    cursors: {
                        alias: 'c',
                        describe:
                            'Include if the provided path or script returns cursors.',
                        boolean: true
                    },
                    values: {
                        alias: 'v',
                        describe:
                            `Space-separated values that correspond with script` +
                            `or path.You must escape dynamic references in your query (i.e. /$1, /$2).`,
                        array: true,
                        string: true
                    }
                });
        },
        (args) => {
            const { format, path, values, cursors } = args;

            const script = (() => {
                if (typeof path !== 'string') {
                    throw new Error('Expected a string, received undefined.');
                }

                if (isPathLike(path)) {
                    if (!existsSync(path)) {
                        console.error(
                            chalk.red('Script does not exist at ' + path + '.')
                        );
                        exit();
                    }

                    return {
                        script: readFileSync(path, 'utf-8'),
                        path: resolve(path)
                    };
                }

                return { script: path };
            })();

            PgRunnerConfig.selectedConnection
                .pipe(
                    concatMap((config) =>
                        new Query(
                            config,
                            script.script,
                            script.path,
                            cursors,
                            <'json' | 'table'>format,
                            values
                        ).execute()
                    )
                )
                .subscribe();
        }
    )
    .command(
        'pgsql',
        'Opens a psql session.',
        (yargs) => yargs,
        () => {
            const psql = (config: Connection, rl: readline.Interface) => {
                rl.question('psql=# ', (text) => {
                    if (text === 'exit') exit();
                    new Query(config, text).execute().subscribe({
                        complete: () => psql(config, rl)
                    });
                });
            };

            PgRunnerConfig.selectedConnection.subscribe((connection) => {
                psql(
                    connection,
                    readline.createInterface({
                        input: process.stdin,
                        output: process.stdout
                    })
                );
            });
        }
    )
    .version(appVerison())
    .fail((msg, err) => {
        if (isPgNativeError(err)) {
            console.error(chalk.red(err));
        }

        if (isNativeError(err)) {
            console.error(chalk.red(err.message));
            process.exit(1);
        }

        if (typeof err === 'string') {
            process.exit(1);
        }

        if (msg) console.error(chalk.red(msg));
    });
