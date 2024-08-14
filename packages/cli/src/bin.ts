#!/usr/bin/env node

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { isNativeError } from 'util/types';

import { isPgNativeError } from './error.js';
import { registerPsql } from './pgsql/command.js';
import { registerInsert } from './insert/command.js';
import { registerExec } from './exec/command.js';
import { registerConfig } from './config/command.js';
import { argv } from 'process';
import { registerWorkspace } from './workspace/command.js';

let cli = yargs(hideBin(argv)).scriptName('rxpg');
cli = registerPsql(cli);
cli = registerWorkspace(cli);
cli = registerInsert(cli);
cli = registerExec(cli);
cli = registerConfig(cli);
cli.fail((msg, err) => {
    if (isPgNativeError(err)) {
        console.error(err);
    }
    if (isNativeError(err)) {
        console.error(err.message);
        process.exit(1);
    }
    if (typeof err === 'string') {
        process.exit(1);
    }
    if (msg) console.error(msg);
})
    .version(
        (() => {
            const dir = dirname(fileURLToPath(import.meta.url));
            const root = join(dir, '..', 'package.json');
            if (existsSync(root)) {
                return JSON.parse(readFileSync(root, 'utf-8'))
                    .version as string;
            }
            return 'unknown';
        })()
    )
    .parse();

// @YargsModule({
//     scriptName: 'rxpg',
//     argv: process.argv,
//     commands: [ExecCommand, InsertCommand, PsqlCli, ConfigCommand],
//     fail: (msg, err) => {
//         if (isPgNativeError(err)) {
//             console.error(err);
//         }

//         if (isNativeError(err)) {
//             console.error(err.message);
//             process.exit(1);
//         }

//         if (typeof err === 'string') {
//             process.exit(1);
//         }

//         if (msg) console.error(msg);
//     },
//     appVersion: () => {
//         const dir = dirname(fileURLToPath(import.meta.url));
//         const root = join(dir, '..', 'package.json');
//         if (existsSync(root)) {
//             return JSON.parse(readFileSync(root, 'utf-8')).version as string;
//         }

//         return 'unknown';
//     }
// })
// export class PgRunnerCli {}
