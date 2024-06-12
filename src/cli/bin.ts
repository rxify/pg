#!/usr/bin/env node

import { concatMap } from 'rxjs';
import { existsSync, readFileSync } from 'fs';
import { exit } from 'process';
import { fileURLToPath } from 'url';
import { hideBin } from 'yargs/helpers';
import { isNativeError } from 'util/types';
import { resolve, dirname, join } from 'path';

import chalk from 'chalk';
import readline from 'node:readline';
import yargs from 'yargs';

import { InitializeParams, initialize } from './internal.js';
import { executeQuery } from './execute.js';

const appVerison = () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const root = join(dir, '..', 'package.json');
    if (existsSync(root)) {
        return JSON.parse(readFileSync(root, 'utf-8')).version as string;
    }

    return 'unknown';
};

const descriptions = {
    s: 'An SQL script wrapped in double-quotes',
    p: 'Path to a local .sql script to execute',
    c: `Flag indicating that the script or path returns cursors`,
    f: 'The format of results printed to the console',
    v: 'Space-separated values that correspond with script or path.    You must escape dynamic references in your query (i.e. "/$1"   instead of "$1")'
};

const cli = yargs(hideBin(process.argv))
    .options({
        script: {
            alias: 's',
            describe: descriptions.s,
            type: 'string',
            conflicts: ['p'],
            coerce: (script) => {
                console.log(script);
                return script;
            }
        },
        path: {
            alias: 'p',
            describe: descriptions.p,
            string: true,
            coerce: (path) => {
                path = resolve(path);

                if (!existsSync(path)) {
                    throw new Error(`File at ${path} does not exist.`);
                }

                try {
                    return readFileSync(path, 'utf-8');
                } catch {
                    throw new Error(`Failed to read file at ${path}.`);
                }
            },
            conflicts: ['s']
        },
        format: {
            alias: 'f',
            describe: descriptions.f,
            choices: ['table', 'json'],
            default: 'table'
        },
        values: {
            alias: 'v',
            describe: descriptions.v,

            array: true,
            string: true
        },
        cursors: {
            describe: descriptions.c,
            coerce: () => true
        },
        psql: {
            describe: 'Opens a psql session.',
            coerce: () => true
        }
    })
    .version(appVerison())
    .help()
    .fail((msg, err) => {
        if (isNativeError(err)) {
            console.error(chalk.red(err.message));
            process.exit(1);
        }

        if (typeof err === 'string') {
            console.error(chalk.red(err));
            process.exit(1);
        }

        if (msg) console.error(chalk.red(msg));
    });

const cliArgs = await cli.parse();

if (cliArgs.psql) {
    const psql = (
        config: InitializeParams,
        rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        })
    ) => {
        rl.question('psql=# ', (text) => {
            if (text === 'exit') exit();
            executeQuery(config, text).subscribe({
                complete: () => psql(config, rl)
            });
        });
    };

    initialize().subscribe({
        next: (config) => {
            psql(config);
        }
    });
} else {
    initialize()
        .pipe(
            concatMap((config) =>
                executeQuery(
                    config,
                    cliArgs.script ?? cliArgs.path,
                    cliArgs.cursors,
                    cliArgs.format as any,
                    cliArgs.values ? cliArgs.values : undefined
                )
            )
        )
        .subscribe();
}
