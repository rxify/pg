export function parseArg(args, options) {
    let { long, short, type } = options;
    let index = args.findIndex((arg) => new RegExp('^-{0,}' + short + '$').test(arg));
    if (index === -1) {
        index = args.findIndex((arg) => new RegExp('^-{0,}' + long + '$').test(arg));
    }
    let value = (() => {
        const val = args[index + 1];
        if (!val)
            return null;
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
    return {
        type,
        long,
        short,
        value,
        index
    };
}
