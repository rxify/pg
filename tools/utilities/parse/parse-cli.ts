import { argv } from 'process';
import { Argument, Cli } from '../types.js';

// @ts-ignore
export function parseCli(cli: Cli, args: typeof argv) {
    args = args.slice(2);

    const command = cli.commands?.find((cmd) => args.includes(cmd.name));

    if (command) {
        const argIndex = args.findIndex((arg) => arg === command.name);

        if (argIndex === -1) return null;

        if (command.args) {
            // command.args.map((arg) => {
            //     parseArg(args, arg);
            // });
        }
    }
}

export function parseArg(
    // @ts-ignore
    { alias, name, flags, options }: Argument,
    args: typeof argv
) {
    const argIndex = parseNameOrAlias(args, name, alias);
    return null;
}

export function parseNameOrAlias(
    args: typeof argv,
    name: string | string[],
    alias?: string
) {
    if (!Array.isArray(name)) {
        name = ['-' + name];
    } else {
        name = name.map((nm) => '-' + nm);
    }

    const aliasIndex = args.findIndex((arg) => arg === '-' + alias);
    if (aliasIndex > -1) return aliasIndex;

    const nameIndex = args.findIndex((arg) => name.includes(arg));
    if (nameIndex > -1) return nameIndex;

    return null;
}
