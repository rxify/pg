import { existsSync } from 'fs';
import { resolve } from 'path';
import { exit } from 'process';
import type { Argv } from 'yargs';
import { csvToQuery } from './csv-to-query.js';
import { exec } from '../exec/exec.js';
import { Command, Handle, Build } from '@fusion-rx/yargs-di';
import type { ArgvGeneric } from '@fusion-rx/yargs-di';

@Command({
    command: 'insert [path]',
    description: 'Bulk insert records from a csv file.',
    showAppVersion: true,
    showHelp: true,
    epilogue: [
        'See https://www.postgresql.org/docs/current/sql-insert.html#SQL-ON-CONFLICT for "ON CONFLICT" documentation.'
    ],
    examples: [
        'pg-runner insert ./script.sql --into schema.table',
        'pg-runner insert ./script.sql --into schema.table --on-conflict "DO NOTHING"'
    ]
})
export class InsertCommand {
    @Build()
    public build(yargs: Argv) {
        return yargs
            .positional('path', {
                describe:
                    'The path to a .csv file relative to the current directory',
                requiresArg: true,
                type: 'string',
                coerce: (val) => {
                    val = resolve(val);
                    if (existsSync(val)) return val;
                    console.error('File at ' + val + ' does not exist.');
                    exit();
                }
            })
            .option('into', {
                describe:
                    'Specify that table that data should be inserted into',
                type: 'string'
            })
            .option('columns', {
                describe:
                    'Specify the columns that data should be inserted into',
                array: true,
                type: 'string',
                requiresArg: false
            })
            .option('on-conflict', {
                describe: 'Specify an ON CONFLICT clause, wrapped in quotes.',
                type: 'string',
                requiresArg: false,
                coerce: (val: string) => {
                    if (/on conflict/i.test(val)) return val;
                    return 'ON CONFLICT ' + val;
                }
            })
            .option('write', {
                describe: `Write the script output to resolve('out.sql')`,
                type: 'boolean'
            });
    }

    @Handle()
    public handle(args: ArgvGeneric<ReturnType<this['build']>>): void {
        if (!args.into) {
            console.error(
                'You must specify a table for the INSERT statement with --into. See --help for details.'
            );
            exit();
        }

        const { queryStr, values } = csvToQuery(
            args.path,
            args.into,
            args.columns,
            args['on-conflict'],
            args.write
        );

        exec(queryStr, 'table', values);
    }
}
