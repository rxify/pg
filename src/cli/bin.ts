#!/usr/bin/env node

import { dirname, join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { isNativeError } from 'util/types';

import { isPgNativeError } from './error.js';
import { PsqlCli } from './pgsql/command.js';
import { InsertCommand } from './insert/command.js';
import { YargsModule } from '../yargs-di/di/module.js';
import { ExecCommand } from './exec/command.js';
import { ConfigCommand } from './config/command.js';

@YargsModule({
    scriptName: 'pg-runner',
    argv: process.argv,
    commands: [ExecCommand, InsertCommand, PsqlCli, ConfigCommand],
    fail: (msg, err) => {
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
    },
    appVersion: () => {
        const dir = dirname(fileURLToPath(import.meta.url));
        const root = join(dir, '..', 'package.json');
        if (existsSync(root)) {
            return JSON.parse(readFileSync(root, 'utf-8')).version as string;
        }

        return 'unknown';
    }
})
export class PgRunnerCli {}
