import {
    ArgumentLine,
    CommandLine,
    HelpLineFormatted,
    OptionLine
} from './types.js';

export function format(commands: CommandLine[], lineLen = 80) {
    let indent = 0;

    commands.forEach((command) => {
        if (command.arguments) {
            command.arguments.forEach((arg) => {
                if (arg.name.length <= indent) return;
                indent = arg.name.length + 2;
            });
        }

        if (command.name.length <= indent) return;
        indent = command.name.length + 2;
    });

    return commands.map((cmd): HelpLineFormatted | null => {
        if (!cmd.arguments) {
            console.log(
                wordWrap(cmd.name, cmd.description, indent, lineLen).join('\n')
            );
        }

        cmd.arguments?.forEach((arg) => {
            if (arg.name.length <= indent) return;
            indent = arg.name.length + 2;
        });

        cmd.arguments?.map((argument) => {
            return formatArgument(argument, argument.name, indent, lineLen);
        });

        const formatted = wordWrap(cmd.name, cmd.description, indent, lineLen);

        const toReturn: HelpLineFormatted = {
            line: formatted.join('\n')
        };

        return toReturn;
    });
}

function formatArgument(
    argument: ArgumentLine,
    commandName: string,
    indent: number,
    lineLen: number
) {
    const wrapped = wordWrap(
        commandName,
        argument.description,
        indent,
        lineLen
    );

    const args = argument.options?.map((option) => {
        return formatOption(option, commandName, indent, lineLen);
    });

    const flags = argument.flags?.map((flag) => {
        let name = flag.name;
        const _indent = commandName.length - name.length;
        name = ' '.repeat(_indent) + name;
        return wordWrap(name, flag.description, indent, lineLen).join('\n');
    });

    console.log(wrapped.join('\n'));
    console.log(args?.join('\n'));
    console.log(flags?.join('\n'));
}

function formatOption(
    option: OptionLine,
    commandName: string,
    indent: number,
    lineLen: number
) {
    let name = option.name;
    name = ' '.repeat(commandName.length - name.length) + name;

    const rows: string[] = [];

    if (option.options) {
        const optIndent = lineLen - option.options.length;
        rows.push(' '.repeat(optIndent) + option.options);
    }

    if (option.defaultOpt) {
        const optIndent = lineLen - option.defaultOpt.length;
        rows.push(' '.repeat(optIndent) + option.defaultOpt);
    }

    const mappedOption = wordWrap(
        name,
        option.description,
        indent,
        lineLen
    ).join('\n');

    return mappedOption + (rows.length > 0 ? '\n' + rows.join('\n') : '');
}

function wordWrap(
    argument: string,
    description: string,
    indent: number,
    lineLen: number
) {
    const formatted: string[] = [];

    // Add trailing strings to shorter titles, i.e:
    // this title is really long  description
    // this title is shorter      description
    while (argument.length < indent) {
        argument += ' ';
    }

    /** The description split by spaces. */
    let words = description.split(/\s/g);

    let word: string | undefined;
    let line = argument;
    while ((word = words.shift())) {
        line += ' ' + word;
        if (line.length > lineLen) {
            formatted.push(line);
            line = ' '.repeat(indent);
        }
    }

    if (line.trim().length > 0) {
        return [...formatted, line];
    }

    return formatted;
}
