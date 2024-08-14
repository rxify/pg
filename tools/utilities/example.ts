import { argv } from 'process';
// import { printHelp } from './help/print-help.js';
import { Cli } from './types.js';
import { parseCli } from './parse/parse-cli.js';

const cli: Cli = {
    name: 'rxpg',
    commands: [
        {
            name: 'exec',
            description:
                'Execute a local .sql file given an absolute path relative to the current directory or a SQL script wrapped in double-quotes.',
            args: [
                {
                    name: ['path', 'script'],
                    description:
                        'The absolute path relative to the current directory or an SQL script wrapped in double-quotes.',
                    options: [
                        {
                            name: 'format',
                            alias: 'f',
                            description:
                                'The format of the results printed to the console.',
                            choices: ['table', 'json'],
                            defaultOpt: 'table'
                        },
                        {
                            name: 'values',
                            alias: 'v',
                            description:
                                'Space-separated values that correspond with scriptor path. You must escape dynamic references in your query (i.e. /$1, /$2).',
                            type: 'array'
                        }
                    ],
                    flags: [
                        {
                            name: 'cursors',
                            alias: 'c',
                            description:
                                'Include if the provided path or script returns cursors.'
                        }
                    ]
                }
            ]
        },
        {
            name: 'pgsql',
            description: 'Opens a psql session.'
        }
    ],
    globalFlags: [
        {
            name: 'help',
            alias: '-h',
            description: 'Print help'
        }
    ]
};

// printHelp(cli);
console.log(parseCli(cli, argv));
