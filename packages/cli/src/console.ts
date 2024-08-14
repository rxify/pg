import chalk from 'chalk';
import { isNativeError } from 'util/types';

const colorize = (args: any[], colorFn: Function) =>
    args.map((arg) => (typeof arg === 'object' ? arg : colorFn(arg)));

const log = console.log;
console.log = (...args: any[]) => log(...colorize(args, chalk.green));

const warn = console.warn;
console.warn = (...args: any[]) => warn(...colorize(args, chalk.yellow));

const info = console.info;
console.info = (...args: any[]) => info(...colorize(args, chalk.cyan));

const error = console.error;
console.error = (...args: any[]) => {
    args.forEach((arg) => {
        if (isNativeError(arg)) {
            error(chalk.red(arg.stack));
        } else {
            error(chalk.red(arg));
        }
    });
};
