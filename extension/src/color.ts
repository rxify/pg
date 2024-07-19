import { isTruthy } from './truthy';

/**
 * Console foreground colors.
 */
export declare type Color =
    | '\x1b[0m'
    | '\x1b[30m'
    | '\x1b[31m'
    | '\x1b[32m'
    | '\x1b[33m'
    | '\x1b[34m'
    | '\x1b[35m'
    | '\x1b[36m'
    | '\x1b[37m'
    | '\x1b[90m';

/**
 * Determines if val is a Color.
 * @param val Is Color or unkown.
 * @returns True if val is a Color; otherwise, false.
 */
export const isColor = (val: unknown): val is Color =>
    isTruthy<Color> &&
    (val === '\x1b[0m' ||
        val === '\x1b[30m' ||
        val === '\x1b[31m' ||
        val === '\x1b[32m' ||
        val === '\x1b[33m' ||
        val === '\x1b[34m' ||
        val === '\x1b[35m' ||
        val === '\x1b[36m' ||
        val === '\x1b[37m' ||
        val === '\x1b[90m');

/**
 * Console foreground colors.
 */
export namespace Color {
    export const Reset: Color = '\x1b[0m',
        Black: Color = '\x1b[30m',
        Red: Color = '\x1b[31m',
        Green: Color = '\x1b[32m',
        Yellow: Color = '\x1b[33m',
        Blue: Color = '\x1b[34m',
        Magenta: Color = '\x1b[35m',
        Cyan: Color = '\x1b[36m',
        White: Color = '\x1b[37m',
        Gray: Color = '\x1b[90m';

    export const red = (val: any) => Color.Red + val + Color.Reset;
    export const green = (val: any) => Color.Green + val + Color.Reset;
    export const yellow = (val: any) => Color.Yellow + val + Color.Reset;
    export const blue = (val: any) => Color.Blue + val + Color.Reset;
    export const magenta = (val: any) => Color.Magenta + val + Color.Reset;
    export const cyan = (val: any) => Color.Cyan + val + Color.Reset;
    export const white = (val: any) => Color.White + val + Color.Reset;
    export const gray = (val: any) => Color.Gray + val + Color.Reset;
}

export namespace chalk {
    export const Reset: Color = '\x1b[0m',
        Black: Color = '\x1b[30m',
        Red: Color = '\x1b[31m',
        Green: Color = '\x1b[32m',
        Yellow: Color = '\x1b[33m',
        Blue: Color = '\x1b[34m',
        Magenta: Color = '\x1b[35m',
        Cyan: Color = '\x1b[36m',
        White: Color = '\x1b[37m',
        Gray: Color = '\x1b[90m';

    export const red = (val: any) => Color.Red + val + Color.Reset;
    export const green = (val: any) => Color.Green + val + Color.Reset;
    export const yellow = (val: any) => Color.Yellow + val + Color.Reset;
    export const blue = (val: any) => Color.Blue + val + Color.Reset;
    export const magenta = (val: any) => Color.Magenta + val + Color.Reset;
    export const cyan = (val: any) => Color.Cyan + val + Color.Reset;
    export const white = (val: any) => Color.White + val + Color.Reset;
    export const gray = (val: any) => Color.Gray + val + Color.Reset;
}