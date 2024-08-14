import { parseArg } from './parse-arg.js';
export function ArgvParse(args) {
    const keys = [];
    const values = [];
    return {
        command: (name, options) => {
            keys.push(name);
            values.push(parseArg(args, name, options));
            function option(name, options) {
                keys.push(name);
                values.push(parseArg(args, name, options));
                return {
                    option,
                    parse: function () {
                        return {
                            keys,
                            values
                        };
                    }
                };
            }
            return {
                option: function (name, options) {
                    return option(name, options);
                }
            };
        }
    };
}
