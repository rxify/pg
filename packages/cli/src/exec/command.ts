import type { Argv } from 'yargs';

import { exec } from './exec.js';

export function registerExec(yargs: Argv) {
    return yargs.command(
        'exec <path|script>',
        'Execute a local SQL file given an absolute path ' +
            'relative to the current directory or a script ' +
            'wrapped in double-quotes.',
        (yargs) => {
            return yargs
                .positional('<path|script>', {
                    type: 'string',
                    describe:
                        'An absolute path relative to the current directory ' +
                        'or an SQL script wrapped in double-quotes.',
                    demandOption: 'path',
                    string: true
                })
                .string('<path|script>')
                .option('format', {
                    alias: 'f',
                    describe:
                        'The format of the results printed to the console.',
                    choices: ['table', 'json'],
                    default: 'table'
                })
                .option('cursors', {
                    alias: 'c',
                    describe:
                        'Include if the provided path or script returns cursors.',
                    type: 'boolean'
                })
                .option('values', {
                    alias: 'v',
                    describe:
                        'Space-separated values that correspond with script ' +
                        'or path.You must escape dynamic references in your query (i.e. /$1, /$2).',
                    type: 'array',
                    string: true
                })
                .version()
                .help();
        },
        (args) => {
            exec(
                <any>args['path'],
                <any>args.format,
                args.values,
                args.cursors
            );
        }
    );
}
