export function parseArg(args, options) {
    let { long, short, type } = options;
    let index = -1;
    if (short) {
        index = args.findIndex((arg) => new RegExp('^-{0,}' + short + '$').test(arg));
    }
    if (index === -1) {
        index = args.findIndex((arg) => new RegExp('^-{0,}' + long + '$').test(arg));
    }
    if (index === -1) {
        if (options.required) {
            throw new Error(`You must specify a ${long}.`);
        }
        return null;
    }
    const parsedArgs = {
        type,
        long,
        short,
        index
    };
    let value = (() => {
        const val = args[index + 1];
        if (options.type === null) {
            if (options.required) {
                throw new Error(`You must provide a value for ${options.long}.`);
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
