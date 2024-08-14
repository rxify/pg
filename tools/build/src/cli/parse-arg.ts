import { Arg, ArgOptions, ArgType, ParsedArg } from './types.js';

export function parseArg<T extends ArgType>(
    args: string[],
    options: ArgOptions<T> & {
        required: false;
        handler: (
            parsedArg: ParsedArg & {
                value?: Arg<T>;
            }
        ) => void;
    }
): ParsedArg | null;

export function parseArg<T extends ArgType>(
    args: string[],
    options: ArgOptions<T> & {
        required: true;
        handler: (
            parsedArg: ParsedArg & {
                value: Arg<T>;
            }
        ) => void;
    }
): ParsedArg & {
    value: Arg<T>;
};

export function parseArg<T extends ArgType = null>(
    args: string[],
    options: ArgOptions<T> & {
        handler: (parsedArg: any) => void;
    }
):
    | (ParsedArg & {
          value?: Arg<T>;
      })
    | null {
    let { long, short, type } = options;

    let index = -1;

    if (short) {
        index = args.findIndex((arg) =>
            new RegExp('^-{0,}' + short + '$').test(arg)
        );
    }

    if (index === -1) {
        index = args.findIndex((arg) =>
            new RegExp('^-{0,}' + long + '$').test(arg)
        );
    }

    if (index === -1) {
        if (options.required) {
            throw new Error(`You must specify a ${long}.`);
        }

        return null;
    }

    const parsedArgs: ParsedArg & {
        value?: any | undefined;
    } = {
        type,
        long,
        short,
        index
    };

    let value = (() => {
        const val = args[index + 1];

        if (options.type === null) {
            if (options.required) {
                throw new Error(
                    `You must provide a value for ${options.long}.`
                );
            }
            return undefined;
        }

        switch (type) {
            case 'array':
                return type.split(/ /g);
            case 'boolean':
                return val === 'true';
            case 'number':
                return parseInt(val);
            default:
                return val;
        }
    })();

    if (value) {
        parsedArgs.value = value;
    }

    if (options.handler && index > -1) {
        options.handler(parsedArgs);
    }

    return parsedArgs;
}
