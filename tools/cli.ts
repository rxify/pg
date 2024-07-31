export declare type CliElement = {
    name: string | string[];
    description?: string;
    alias?: string;
};

export declare type Argument = CliElement;

export declare type Option = CliElement & {
    options?: string[];
    defaultOpt?: string;
    type?: 'array' | 'number' | 'boolean';
};

export declare type Flag = CliElement;

export declare type Command = {
    name: string;
    description: string;
    arguments?: Argument[];
    options?: Option[];
    flags?: Flag[];
};

export declare type Cli = {
    name: string;
    commands?: Command[];
};

type WordWrap = {
    title?: string;
    column_1: string;
    column_2: string;
    line?: string;
};

type Wrapped = {
    title?: string;
    out: string;
    children?: Wrapped[];
};

export class Parse {
    static help(cli: Cli, lineLen = 80) {
        return Parse.wrap(Parse.command(cli.name, cli.commands, lineLen))
            .flatMap((cmd) => {
                if (cmd.title) return [cmd.title, cmd.out];
                return [cmd.out];
            })
            .join('\n');
    }

    static command(name: string, commands: Command[] = [], lineLen: number) {
        return commands.flatMap((command, index) => {
            let column_1 = '  ' + name + ' ' + command.name;

            command.arguments?.forEach((arg) => {
                if (Array.isArray(arg.name)) arg.name = arg.name.join('|');
                column_1 += `<${arg.name}>`;
            });

            return [
                {
                    title: index === 0 ? 'Command:\n' : '\n\nCommand\n',
                    column_1,
                    column_2: command.description
                },
                ...Parse.options(column_1, command.options, lineLen),
                ...Parse.flags(column_1, command.flags)
            ];
        });
    }

    static options(column_1: string, options: Option[] = [], lineLen: number) {
        return options.flatMap(
            ({ alias, name, description, options, defaultOpt }, index) => {
                name = '--' + name;
                alias = alias ? '-' + alias + ', ' : ' '.repeat(4);

                let col_1 = '  ' + ' '.repeat(column_1.length) + alias + name;

                const rows: WordWrap[] = [
                    {
                        title: index === 0 ? 'Options: ' : undefined,
                        column_1: col_1,
                        column_2: description ?? ''
                    }
                ];

                if (options) {
                    let opt = `[choices: ${options.join(' | ')}]`;
                    if (defaultOpt) opt += ' ' + `[default: ${defaultOpt}]`;

                    while (opt.length < lineLen) {
                        opt = ' ' + opt;
                    }

                    rows.push({
                        line: opt,
                        column_1: '',
                        column_2: ''
                    });
                }

                return rows;
            }
        );
    }

    static flags(column_1: string, flags: Flag[] = []) {
        return flags.map(({ alias, name, description }, index): WordWrap => {
            name = '--' + name;
            alias = alias ? '-' + alias + ', ' : ' '.repeat(4);

            return {
                title: index === 0 ? 'Flags: ' : undefined,
                column_1: '  ' + ' '.repeat(column_1.length) + alias + name,
                column_2: description ?? ''
            };
        });
    }

    static wrap(args: WordWrap[], lineLen = 80) {
        args.sort((a, b) => {
            if (a.column_1.length === b.column_1.length) return 0;
            if (a.column_1.length < b.column_1.length) return 1;
            return 1;
        });

        const indent = args[0]?.column_1.length + 2;

        return args.map((cmd): Wrapped => {
            if (cmd.line) {
                return {
                    out: cmd.line
                };
            }

            // Add trailing strings to shorter titles, i.e:
            // this title is really long  description
            // this title is shorter      description
            while (cmd.column_1.length < indent) {
                cmd.column_1 += ' ';
            }

            const lines: string[] = [];
            let line = cmd.column_1;
            let words = cmd.column_2.split(/\s/g);
            let word: string | undefined;

            while ((word = words.shift())) {
                line += ' ' + word;
                if (line.length > lineLen) {
                    lines.push(line);
                    line = ' '.repeat(indent);
                }
            }
            lines.push(line);

            const toReturn: Wrapped = {
                title: cmd.title,
                out: lines.join('\n')
            };

            return toReturn;
        });
    }
}

const cli: Cli = {
    name: 'pg-runner',
    commands: [
        {
            name: 'exec',
            description:
                'Execute a local .sql file given an absolute path relative to the current directory or a SQL script wrapped in double-quotes.',
            arguments: [
                {
                    name: ['path', 'script'],
                    description:
                        'The absolute path relative to the current directory or an SQL script wrapped in double-quotes.'
                }
            ],
            options: [
                {
                    name: 'format',
                    alias: 'f',
                    description:
                        'The format of the results printed to the console.',
                    options: ['table', 'json'],
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
        },
        {
            name: 'pgsql',
            description: 'Opens a psql session.'
        }
    ]
};
