import type { Argv } from 'yargs';
import { Handle, Build } from '@fusion-rx/yargs-di';

import { exec } from './exec.js';
import { Command } from '../../yargs-di/di/command.js';

const describePath =
    'An absolute path relative to the current directory ' +
    'or an SQL script wrapped in double-quotes.';

const describeCursors =
    'Include if the provided path or script returns cursors.';

const describeValues =
    'Space-separated values that correspond with script ' +
    'or path.You must escape dynamic references in your query (i.e. /$1, /$2).';

@Command({
    command: 'exec <path|script>',
    description:
        'Execute a local SQL file given an absolute path ' +
        'relative to the current directory or a script ' +
        'wrapped in double-quotes.'
})
export class ExecCommand {
    @Handle()
    public handle(args: any): void {
        exec((<any>args).path, <any>args.format, args.values, args.cursors);
    }

    @Build()
    public build(yargs: Argv) {
        return yargs
            .positional('<path|script>', {
                type: 'string',
                describe: describePath,
                demandOption: 'path',
                string: true
            })
            .option('format', {
                alias: 'f',
                describe: 'The format of the results printed to the console.',
                choices: ['table', 'json'],
                default: 'table'
            })
            .option('cursors', {
                alias: 'c',
                describe: describeCursors,
                type: 'boolean'
            })
            .option('values', {
                alias: 'v',
                describe: describeValues,
                type: 'array',
                string: true
            });
    }
}
