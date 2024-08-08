import { format } from './format-help.js';
import { ArgumentLine, OptionLine } from './types.js';
import { Argument, Cli, Flag, Option } from '../types.js';

export function printHelp({ name: cliName, commands }: Cli, lineLen = 80) {
    const cmds = (commands ?? []).flatMap((command) => {
        if (!command.args) {
            return {
                name: cliName + ' ' + command.name,
                description: command.description
            };
        }

        return {
            name: command.name,
            arguments: command.args?.map((arg) =>
                argument(cliName, command.name, arg)
            ),
            description: command.description
        };
    });

    return format(cmds, lineLen);
}

function argument(
    cliName: string,
    commandName: string,
    arg: Argument
): ArgumentLine {
    if (Array.isArray(arg.name)) arg.name = arg.name.join('|');

    return {
        description: arg.description,
        name: `${cliName} ${commandName} <${arg.name}>`,
        options: arg.options?.flatMap((opt) => option(opt)),
        flags: arg.flags?.map((flg) => flag(flg))
    };
}

function option({
    alias,
    name,
    description,
    defaultOpt,
    choices,
    type
}: Option) {
    name = '--' + name;
    alias = alias ? '-' + alias + ', ' : '';

    const row: OptionLine = {
        name: alias + name,
        description,
        type
    };

    if (choices) {
        let opt = `[choices: ${choices.join(' | ')}]`;
        row.options = opt;
    }

    if (defaultOpt) {
        row.defaultOpt = `[default: ${defaultOpt}]`;
    }

    return row;
}

function flag({ alias, name, description }: Flag) {
    name = '--' + name;

    alias = alias ? '-' + alias + ', ' : '';

    return {
        name: alias + name,
        description: description
    };
}
